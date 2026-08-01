#----------------------
# Parse makefile arguments
#----------------------
RUN_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
$(eval $(RUN_ARGS):;@:)

#----------------------
# Silence GNU Make
#----------------------
ifndef VERBOSE
MAKEFLAGS += --no-print-directory
endif

#----------------------
# Load .env file
#----------------------
ifneq ("$(wildcard .env)","")
include .env
export
else
endif

DRUNPREFIX=
ifeq ($(OS),Windows_NT)
    DRUNPREFIX = winpty
endif

COMPOSE_COMMAND=docker-compose
ifeq ($(APP_ENV),production)
	COMPOSE_COMMAND=docker-compose -f docker-compose.yml -f docker-compose.prod.yml
endif

.PHONY: build test

HELP_FUN = %help; while (<>) { /^([A-Za-z0-9_-]+)\s*:.*\#\#(?:@([A-Za-z0-9_-]+))?\s(.*)$$/ or next; push @{$$help{$$2 || "other"}}, [$$1, $$3]; $$width = length($$1) if length($$1) > $$width } print "\n"; for $$category (sort keys %help) { print "\e[37m$$category\e[0m\n"; for $$entry (@{$$help{$$category}}) { printf "  \e[33m%-*s\e[0m  \e[32m%s\e[0m\n", $$width, $$entry->[0], $$entry->[1] } }

help: ##@other Show this help.
	@perl -e '$(HELP_FUN)' $(MAKEFILE_LIST)

#----------------------
# docs
#----------------------

docs-generate: ##@docs Generate docs pages and example manifest
	@cd backend && go run . docs:generate

docs-proof-stats: ##@docs Refresh checked-in proof statistics from sibling repositories
	@cd docs && npm run proof:refresh

docs-check-proof-stats: ##@docs Verify checked-in proof statistics match sibling repositories
	@cd docs && npm run proof:check

docs-check-scenarios: ##@docs Verify generated scenario pages match framework specs
	@cd ../goforj && go run ./cmd/forj scenario:generate --all --check

docs-build: docs-check-proof-stats docs-check-scenarios ##@docs Verify generated evidence and build VitePress docs
	@cd docs && npm run build

docs-embed: ##@docs Copy built docs into backend embed folder
	@rm -rf backend/frontend/dist
	@mkdir -p backend/frontend/dist
	@cp -R docs/.vitepress/dist/. backend/frontend/dist/

docs-package: ##@docs Generate + build docs and stage for backend
	@$(MAKE) docs-generate
	@$(MAKE) docs-build
	@$(MAKE) docs-embed

#----------------------
# docker
#----------------------

DOCKER_PROD_IMAGE ?= docs-web:latest
DOCKER_PROD_PUSH ?= 0

docker-production: ##@docker Build the production web image
	@docker buildx build \
		-f containers/web/Dockerfile \
		--build-arg GA_MEASUREMENT_ID=$(GA_MEASUREMENT_ID) \
		-t $(DOCKER_PROD_IMAGE) \
		$(if $(filter 1 true yes,$(DOCKER_PROD_PUSH)),--push,--load) \
		.

docker-build-prod: docker-generate-docs-prod docker-production ##@docker Generate docs and build production image

docker-generate-docs-prod: ##@docker Generate docs from upstream repos in a one-off container (updates docs/libraries/*.md)
	@$(COMPOSE_COMMAND) run --rm --build docs-generate

docker-deploy-prod: ##@docker Generate docs, build prod image, and roll web container
	@$(MAKE) docker-build-prod
	@$(COMPOSE_COMMAND) up -d --force-recreate web

#----------------------
# build
#----------------------

build: ##@build Build backend binary
	@mkdir -p bin
	@cd backend && go build -o ../bin/docs .
