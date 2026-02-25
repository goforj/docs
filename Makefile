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

#----------------------
# Terminal
#----------------------

GREEN  := $(shell tput -Txterm setaf 2)
WHITE  := $(shell tput -Txterm setaf 7)
YELLOW := $(shell tput -Txterm setaf 3)
RESET  := $(shell tput -Txterm sgr0)

#------------------------------------------------------------------
# - Add the following 'help' target to your Makefile
# - Add help text after each target name starting with '\#\#'
# - A category can be added with @category
#------------------------------------------------------------------

.PHONY: build test

HELP_FUN = \
	%help; \
	while(<>) { \
		push @{$$help{$$2 // 'options'}}, [$$1, $$3] if /^([a-zA-Z\-]+)\s*:.*\#\#(?:@([a-zA-Z\-]+))?\s(.*)$$/ }; \
		print "\n"; \
		for (sort keys %help) { \
			print "${WHITE}$$_${RESET \
		}\n"; \
		for (@{$$help{$$_}}) { \
			$$sep = " " x (32 - length $$_->[0]); \
			print "  ${YELLOW}$$_->[0]${RESET}$$sep${GREEN}$$_->[1]${RESET}\n"; \
		}; \
		print ""; \
	}

help: ##@other Show this help.
	@perl -e '$(HELP_FUN)' $(MAKEFILE_LIST)

#----------------------
# docs
#----------------------

docs-generate: ##@docs Generate docs pages and example manifest
	@cd backend && go run . docs:generate

docs-build: ##@docs Build VitePress docs
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
DOCKER_PROD_CACHE_FROM ?= type=local,src=.cache/buildx-docs-web
DOCKER_PROD_CACHE_TO ?= type=local,dest=.cache/buildx-docs-web,mode=max

docker-production: ##@docker Build production web image with buildx cache (set DOCKER_PROD_IMAGE / DOCKER_PROD_CACHE_FROM / DOCKER_PROD_CACHE_TO / DOCKER_PROD_PUSH=1)
	@DRIVER="$$(docker buildx inspect --format '{{.Driver}}' 2>/dev/null || echo docker)"; \
	CACHE_FLAGS=""; \
	if [ "$$DRIVER" = "docker-container" ] || [ "$$DRIVER" = "kubernetes" ] || [ "$$DRIVER" = "remote" ]; then \
		CACHE_FLAGS="--cache-from=$(DOCKER_PROD_CACHE_FROM) --cache-to=$(DOCKER_PROD_CACHE_TO)"; \
	else \
		echo "buildx driver '$$DRIVER' does not support cache export; building without explicit cache import/export"; \
	fi; \
	docker buildx build \
		-f containers/web/Dockerfile \
		--build-arg GA_MEASUREMENT_ID=\"$(GA_MEASUREMENT_ID)\" \
		$$CACHE_FLAGS \
		-t $(DOCKER_PROD_IMAGE) \
		$(if $(filter 1 true yes,$(DOCKER_PROD_PUSH)),--push,--load) \
		.

docker-build-prod: docker-production ##@docker Alias: production build with buildx cache

#----------------------
# build
#----------------------

build: ##@build Build backend binary
	@mkdir -p bin
	@cd backend && go build -o ../bin/docs .
