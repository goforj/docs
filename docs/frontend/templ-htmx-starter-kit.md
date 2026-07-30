---
title: templ + htmx Starter Kit
description: Build a server-rendered Go application with templ components, htmx navigation, and a small frontend asset pipeline.
---

# templ + htmx Starter Kit

The templ + htmx starter kit is the Go-first Web UI option. Routes, application behavior, view models, and HTML rendering stay in Go; htmx makes navigation and form interactions feel immediate without introducing a client-side application architecture.

The generated starter includes a dashboard, settings pages, a component gallery, Tailwind CSS, and local Basecoat components. See the [Starter Kit Guide](/getting-started/starter-kits) when choosing between this approach and React or Vue.

## Create and Run

Start the Project wizard:

```bash
forj new
```

Expected result: the wizard asks whether the Project needs Web UI and offers templ + htmx as a starter-kit choice.

Enable Web UI, choose templ + htmx, and then start the development loop:

```bash
forj dev
```

Expected result: the frontend assets and Go application build, then the default App starts. Open `/` for the dashboard, `/components/overview` for the component gallery, and `/settings/profile` for a representative form. Projects with Auth and a database also register `/login`.

`forj dev` coordinates the frontend asset build, templ generation, Go build, and App restart. A successful change replaces the running process; a failed change leaves the last successful process running.

## Where to Make Changes

The files are organized by the kind of change you are making:

| Change | File |
| --- | --- |
| Add a route or request handler | `internal/starterui/controller.go` |
| Add or edit a page | `internal/starterui/*.templ` |
| Change data passed to a page | `internal/starterui/viewmodels.go` |
| Change the shared shell or navigation | `internal/starterui/layout.templ` |
| Add styles | `cmd/app/frontend/src/style.css` |
| Add a small browser interaction | `cmd/app/frontend/src/app.ts` |
| Test rendered responses | `internal/starterui/controller_test.go` |

Edit `.templ` files directly. The templ compiler recreates `*_templ.go`; do not edit those generated Go files.

## How a Page Is Rendered

The starter uses the same route and controller model as the rest of a GoForj application:

```text
GET / → Controller.Dashboard → PageData → DashboardPage → HTML response
```

The generated dashboard route is intentionally small. The controller chooses the page and supplies its view model:

<CodeFile path="internal/starterui/controller.go">

```go
func (c *Controller) Routes() []web.Route {
	return []web.Route{
		web.NewRoute(http.MethodGet, "/", c.Dashboard),
		// ...
	}
}

func (c *Controller) Dashboard(r web.Context) error {
	return c.renderAppPage(r, "Dashboard", DashboardPage)
}
```

</CodeFile>

The templ component receives that data and composes the shared application shell. For a first change, replace the generated dashboard contents with something small:

<CodeFile path="internal/starterui/dashboard.templ">

```templ
package starterui

templ DashboardPage(data PageData) {
	@shell(data) {
		<div class="page-stack">
			<h1>{ data.Title }</h1>
			<p>Replace the starter dashboard with your first workflow.</p>
		</div>
	}
}
```

</CodeFile>

Keep domain work in services. A controller should call those services, convert the result into display-oriented data, and pass that data to a templ component.

## How htmx Fits

The starter uses `hx-boost` on its navigation. A click still performs a normal `GET`, but htmx swaps the returned document body instead of asking the browser to perform a full navigation. Reduced to the attributes that control that behavior, the generated navigation looks like this:

<CodeFile path="internal/starterui/layout.templ">

```templ
<div
	role="group"
	aria-labelledby="platform-sidebar-group"
	hx-boost="true"
	hx-target="body"
	hx-swap="innerHTML show:none"
>
	<a href="/">Dashboard</a>
	<a href="/components/overview">Components</a>
</div>
```

</CodeFile>

This means the route, controller, and page remain useful when JavaScript is unavailable. htmx enhances the request rather than defining a separate browser-side routing model.

### Add a Partial Update

The starter pages return complete documents. When one interaction benefits from replacing a smaller region, render a smaller templ component from a dedicated handler.

For example, a reports page can search through an injected reports service and replace only its results:

<CodeFile path="internal/starterui/reports.templ">

```templ
package starterui

templ ReportsPage(data PageData, reports []ReportRow) {
	@shell(data) {
		<form
			hx-get="/reports/results"
			hx-target="#report-results"
			hx-swap="innerHTML"
		>
			<input name="q" type="search" placeholder="Search reports"/>
			<button type="submit">Search</button>
		</form>
		<table>
			<thead>
				<tr><th>Name</th><th>Status</th></tr>
			</thead>
			<tbody id="report-results">
				@ReportRows(reports)
			</tbody>
		</table>
	}
}

templ ReportRows(reports []ReportRow) {
	for _, report := range reports {
		<tr>
			<td>{ report.Name }</td>
			<td>{ report.Status }</td>
		</tr>
	}
}
```

</CodeFile>

Register the partial endpoint beside the full page. The existing `render` helper accepts any `templ.Component`, so it can return `ReportRows` without rendering the shell:

<CodeFile path="internal/starterui/controller.go">

```go
func (c *Controller) Routes() []web.Route {
	return []web.Route{
		web.NewRoute(http.MethodGet, "/reports/results", c.ReportResults),
		// ...
	}
}

func (c *Controller) ReportResults(r web.Context) error {
	reports, err := c.reports.Search(r.Context(), r.Query("q"))
	if err != nil {
		return err
	}

	return render(r, ReportRows(NewReportRows(reports)))
}
```

</CodeFile>

The example assumes the reports service has been added to `Controller` through its constructor and Wire set. The service owns the search behavior; the handler only translates the request and renders the result.

## Auth-Aware Requests

With Auth and a database enabled, login and logout are working server-side flows and application pages require an authenticated session. Normal unauthenticated navigation redirects to `/login`. An htmx request instead receives `204 No Content` with `HX-Redirect`, allowing htmx to perform the full-page redirect:

<CodeFile path="internal/starterui/controller.go">

```go
if errors.Is(err, auth.ErrUnauthorized) {
	if isHTMX(r) {
		r.SetHeader("HX-Redirect", "/login")
		return r.NoContent(http.StatusNoContent)
	}
	return r.Redirect(http.StatusSeeOther, "/login")
}
```

</CodeFile>

The login form follows the same progressive-enhancement model:

```templ
<form method="post" action="/login" hx-post="/login" hx-target="body">
	<!-- fields -->
</form>
```

A successful htmx login returns `HX-Redirect: /`; validation failures render the form again with an error.

Registration, password reset, and email verification are starter page surfaces, not completed account workflows. Their handlers and product policy remain application work. The templ + htmx controller also replaces the generated JSON Auth controller, so `/api/v1/auth/*` and generated OAuth routes are not mounted by default for this kit.

Without Auth, the starter does not register auth routes or show authenticated logout UI.

## Browser-Side Behavior

`cmd/app/frontend/src/app.ts` imports htmx and Basecoat, then initializes small local controllers for presentation behavior such as menus, dialogs, themes, charts, and tables.

Because htmx replaces DOM nodes, the generated entry point initializes those controllers after both the first page load and later swaps:

<CodeFile path="cmd/app/frontend/src/app.ts">

```ts
document.addEventListener("DOMContentLoaded", () => boot())

document.body.addEventListener("htmx:afterSwap", (event) => {
  if (event.target instanceof HTMLElement) {
    boot(event.target)
    restoreSidebar()
  }
})
```

</CodeFile>

Keep application and authorization decisions on the server. Use `app.ts` for behavior that belongs in the browser, such as focus management, menus, dialogs, and client-side table presentation.

## Build for Deployment

`forj dev` rebuilds frontend assets as they change. For a release build, build the assets explicitly before building the Go application:

```bash
npm --prefix cmd/app/frontend ci &&
  npm --prefix cmd/app/frontend run build &&
  forj build
```

Expected result: `cmd/app/frontend/dist` contains `app.js` and `app.css`, generated templ Go is current, and `bin/app` contains the App that serves those assets.

## Test Rendered Behavior

Generated tests use `httptest` and `webtest`, so handlers can be exercised without starting a listener. For example, the Auth-enabled starter verifies the htmx redirect contract:

<CodeFile path="internal/starterui/controller_test.go">

```go
func TestStarterUIUnauthenticatedHTMXPageRedirectsToLogin(t *testing.T) {
	fixture := newStarterUITestAuthFixture(t)
	controller := NewController(fixture.Service)
	req := httptest.NewRequest(http.MethodGet, "/components/data", nil)
	req.Header.Set("HX-Request", "true")
	rec := httptest.NewRecorder()
	ctx := webtest.NewContext(req, rec, "/components/data", nil)

	if err := controller.Data(ctx); err != nil {
		t.Fatalf("data page: %v", err)
	}
	if rec.Code != http.StatusNoContent {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusNoContent)
	}
	if redirect := rec.Header().Get("HX-Redirect"); redirect != "/login" {
		t.Fatalf("HX-Redirect = %q, want /login", redirect)
	}
}
```

</CodeFile>

Run the package tests and the complete build:

```bash
go test ./internal/starterui
forj build
```

Expected result: the rendered-response tests pass and the App build completes with current templ output.

Add browser-level coverage when behavior depends on swap timing, focus management, or another browser interaction that a handler test cannot observe.

## Add the Kit to Another App

To add the same frontend stack to an additional app:

```bash
forj make:app admin --components web-api,web-ui --starter-kit templ_htmx
```

Expected result: the additional app receives its own assets under `cmd/admin/frontend/`. The server-rendered starter remains the shared `internal/starterui` package; the command does not create a second app-local copy of those views and controllers.

## Next Steps

- [Controllers](/applications/controllers) explains route registration and dependency injection.
- [Requests and Validation](/applications/requests-validation) covers form input.
- [Auth](/security/auth) explains session and browser authentication.
- [forj dev](/developer-tools/forj-dev) explains the coordinated development loop.
