---
title: Validation Library for Go
description: "Typed fluent validation with reusable rules, presence-aware inputs, and structured field errors."
repoSlug: validation
repoUrl: https://github.com/goforj/validation
noAutoTitle: true
---

# Validation Library for Go {#validation-library-for-go}

<p align="center">
  <img src="https://raw.githubusercontent.com/goforj/validation/main/docs/assets/logo.png" width="300" alt="GoForj validation gopher with a checklist">
</p>

<p align="center">Typed fluent validation with reusable rules and useful field errors.</p>

<p align="center">
  <a href="https://pkg.go.dev/github.com/goforj/validation"><img src="https://pkg.go.dev/badge/github.com/goforj/validation.svg" alt="Go Reference"></a>
  <a href="https://github.com/goforj/validation/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
  <a href="https://github.com/goforj/validation/actions/workflows/ci.yml"><img src="https://github.com/goforj/validation/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/goforj/validation/actions/workflows/security.yml"><img src="https://github.com/goforj/validation/actions/workflows/security.yml/badge.svg" alt="Security"></a>
  <img src="https://img.shields.io/badge/go-1.24%2B-blue.svg" alt="Go 1.24 or newer">
  <a href="https://github.com/goforj/validation/releases/tag/v0.2.0"><img src="https://img.shields.io/badge/version-v0.2.0-blue.svg" alt="Version v0.2.0"></a>
  <a href="https://app.codecov.io/gh/goforj/validation"><img src="https://raw.githubusercontent.com/goforj/validation/main/docs/assets/coverage.svg" alt="Measured unit coverage"></a>
  <a href="https://github.com/goforj/validation/blob/main/docs/quality.json"><img src="https://raw.githubusercontent.com/goforj/validation/main/docs/assets/tests.svg" alt="Executed Go tests"></a>
</p>

Keep field names, values, and constraints together. Validate decoded requests, configuration, and domain values using ordinary Go code, with no runtime dependencies.

| Feature | What it provides |
| :--- | :--- |
| <img src="https://raw.githubusercontent.com/goforj/validation/main/docs/assets/check.svg" width="22" height="22" alt="" align="absmiddle">&nbsp;Typed&nbsp;chains | Typed builders for text, numbers, exact decimals, time, and collections. |
| <img src="https://raw.githubusercontent.com/goforj/validation/main/docs/assets/check.svg" width="22" height="22" alt="" align="absmiddle">&nbsp;Reusable&nbsp;rules | Compose rules and plug in custom validators without global registration. |
| <img src="https://raw.githubusercontent.com/goforj/validation/main/docs/assets/check.svg" width="22" height="22" alt="" align="absmiddle">&nbsp;Format&nbsp;checks | Common formats and character checks directly in the fluent chain. |
| <img src="https://raw.githubusercontent.com/goforj/validation/main/docs/assets/check.svg" width="22" height="22" alt="" align="absmiddle">&nbsp;Field&nbsp;errors | Ordered paths, stable codes, custom messages, and localization hooks. |
| <img src="https://raw.githubusercontent.com/goforj/validation/main/docs/assets/check.svg" width="22" height="22" alt="" align="absmiddle">&nbsp;Optional&nbsp;inputs | Distinguish omitted fields, explicit null, and supplied zero values. |

## Quick start {#quick-start}

Requires Go 1.24 or newer.

```sh
go get github.com/goforj/validation@v0.2.0
```

Pass field names and values into typed chains, then validate them together:

```go
err := validation.Validate(
	validation.String("name", "Ada").Required().Min(2),
	validation.String("email", "ada@example.com").Required().IsEmail(),
	validation.Number("age", 36).Min(18),
)

fmt.Println(err)
// <nil>
```

## Validating a registration {#validating-a-registration}

For a fuller request, add password confirmation, conditional requirements, and custom messages. The [complete program](https://github.com/goforj/validation/blob/main/examples/quickstart/main.go) includes the request model and sample input:

```go
registrationErr := validation.Validate(
	// Identity and contact details.
	validation.String("name", req.Name).Required().Min(2).Max(100),
	validation.String("email", req.Email).Required().IsEmail().
		Message("Enter a valid email address."),

	// Password length and confirmation.
	validation.String("password", req.Password).Required().Min(12),
	validation.String("password_confirmation", req.PasswordConfirmation).
		Required().Equal(req.Password),

	// Business accounts must provide a company name.
	validation.String("account_type", req.AccountType).In("personal", "business"),
	validation.String("company", req.Company).
		RequiredIf(req.AccountType == "business"),

	// Eligibility and consent.
	validation.Number("age", req.Age).Min(18),
	validation.Bool("terms", req.Terms).Accepted(),
)
```

This request contains invalid input. Inspect a field's message or iterate over the issue paths and stable codes:

```go
var failures *validation.Errors
if errors.As(registrationErr, &failures) {
	fmt.Println(failures.First("email"))
	// Enter a valid email address.

	for _, issue := range failures.Issues() {
		fmt.Println(issue.Path, issue.Code)
	}
	// email email
	// password_confirmation equal
	// company required
	// terms accepted
}
```

## How it works {#how-it-works}

- **Values are explicit.** Zero and false are ordinary values. Rules evaluate empty strings unless you use a lazy condition to omit a field. Required checks run before content checks.
- **Errors stay useful.** Validation collects the first violation per field by default. Use `New().CollectAll()` for all content failures or `StopOnFirstError()` to stop globally. Custom messages retain their machine code. Unexpected rule errors abort evaluation and remain operational errors.
- **Custom rules fit the same chain.** Implement Rule[T] with Validate(T) error, or use a function adapter. Return validation.Invalid for an input failure. Add RuleWithContext[T] for dependencies that need cancellation.
- **Evaluation is local.** Builders can be branched and reused. Input slices and application dependencies are borrowed. Coordinate concurrent mutation in your application.

See [validation contracts](https://github.com/goforj/validation/blob/main/docs/contracts.md) for presence, formats, paths, configuration errors, ownership, and cancellation.

## Runnable examples {#runnable-examples}

Run from the repository root with `go run ./examples/<name>`. Tests verify every program's output.

[quickstart](https://github.com/goforj/validation/blob/main/examples/quickstart/main.go) · [formats](https://github.com/goforj/validation/blob/main/examples/formats/main.go) · [patch](https://github.com/goforj/validation/blob/main/examples/patch/main.go) · [nested](https://github.com/goforj/validation/blob/main/examples/nested/main.go) · [custom](https://github.com/goforj/validation/blob/main/examples/custom/main.go) · [context](https://github.com/goforj/validation/blob/main/examples/context/main.go) · [domain](https://github.com/goforj/validation/blob/main/examples/domain/main.go) · [errors](https://github.com/goforj/validation/blob/main/examples/errors/main.go) · [constraints](https://github.com/goforj/validation/blob/main/examples/constraints/main.go) · [advanced](https://github.com/goforj/validation/blob/main/examples/advanced/main.go) · [time](https://github.com/goforj/validation/blob/main/examples/time/main.go) · [presence](https://github.com/goforj/validation/blob/main/examples/presence/main.go) · [moreformats](https://github.com/goforj/validation/blob/main/examples/moreformats/main.go) · [policies](https://github.com/goforj/validation/blob/main/examples/policies/main.go) · [decimal](https://github.com/goforj/validation/blob/main/examples/decimal/main.go) · [currency](https://github.com/goforj/validation/blob/main/examples/currency/main.go)

## API index {#api-index}

| Group | Functions |
| ---: | :--- |
| **Values** | [String](#string) · [Number](#number) · [Bool](#bool) · [Validate](#validate) |
| **Formats** | [IsEmail](#isemail) · [IsURL](#isurl) · [IsUUID](#isuuid) · [IsUUIDv4](#isuuidv4) · [IsUUIDv7](#isuuidv7) · [IsIP](#isip) · [IsIPv4](#isipv4) · [IsIPv6](#isipv6) · [IsJSON](#isjson) · [IsBase64](#isbase64) |
| **Conditions** | [When](#when) |
| **Collections** | [Group](#group) · [Slice](#slice) · [Each](#each) |
| **Custom rules** | [Using](#using) · [Invalid](#invalid) |
| **Context** | [ValidateContext](#validatecontext) · [Check](#check) |
| **Domain values** | [Value](#value) · [RuleFunc](#rulefunc) · [ContextRuleFunc](#contextrulefunc) |
| **Errors** | [Label](#label) · [Message](#message) · [First](#first) · [Messages](#messages) · [Issues](#issues) |
| **Constraints** | [Required](#required) · [RequiredIf](#requiredif) · [NotBlank](#notblank) · [Min](#min) · [Max](#max) · [In](#in) · [Equal](#equal) · [Match](#match) · [Accepted](#accepted) |
| **Text constraints** | [Len](#len) · [Contains](#contains) · [NotContains](#notcontains) · [StartsWith](#startswith) · [EndsWith](#endswith) · [NotEqual](#notequal) · [NotIn](#notin) |
| **Numeric constraints** | [GreaterThan](#greaterthan) · [LessThan](#lessthan) · [MultipleOf](#multipleof) |
| **Collection constraints** | [Map](#map) · [Unique](#unique) · [UniqueBy](#uniqueby) · [HasKey](#haskey) · [OnlyKeys](#onlykeys) |
| **Dates and times** | [Time](#time) · [Before](#before) · [After](#after) · [IsDate](#isdate) · [IsDateIn](#isdatein) |
| **Optional inputs** | [Presence](#presence) · [Nullable](#nullable) · [Optional](#optional) · [Provided](#provided) · [Null](#null) · [IsPresent](#ispresent) · [IsNull](#isnull) · [Get](#get) |
| **More formats** | [IsULID](#isulid) · [IsHostname](#ishostname) · [IsCIDR](#iscidr) · [IsMAC](#ismac) · [IsE164](#ise164) · [IsBase64URL](#isbase64url) · [IsAlpha](#isalpha) · [IsAlphanumeric](#isalphanumeric) · [IsDigits](#isdigits) · [IsASCII](#isascii) · [IsLowercase](#islowercase) · [IsUppercase](#isuppercase) · [IsUTF8](#isutf8) |
| **Composition** | [Any](#any) · [All](#all) · [Not](#not) |
| **Evaluation policy** | [New](#new) · [CollectAll](#collectall) · [StopOnFirstError](#stoponfirsterror) · [FormatMessages](#formatmessages) |
| **Exact decimals** | [Decimal](#decimal) · [MaxScale](#maxscale) |
| **Currencies** | [Currency](#currency) · [USD](#usd) · [EUR](#eur) · [GBP](#gbp) |

## Values {#values}

<a id="string"></a>

<a id="number"></a>

<a id="bool"></a>

<a id="validate"></a>

### String · Number · Bool · Validate {#string-number-bool-validate}

String starts a deferred chain for a borrowed application value.

```go
err := validation.Validate(
	validation.String("name", "Ada").Required().Min(2),
	validation.String("email", "ada@example.com").Required().IsEmail(),
	validation.Number("age", 36).Min(18),
)

fmt.Println(err)
// <nil>
```

```go
registrationErr := validation.Validate(
	// Identity and contact details.
	validation.String("name", req.Name).Required().Min(2).Max(100),
	validation.String("email", req.Email).Required().IsEmail().
		Message("Enter a valid email address."),

	// Password length and confirmation.
	validation.String("password", req.Password).Required().Min(12),
	validation.String("password_confirmation", req.PasswordConfirmation).
		Required().Equal(req.Password),

	// Business accounts must provide a company name.
	validation.String("account_type", req.AccountType).In("personal", "business"),
	validation.String("company", req.Company).
		RequiredIf(req.AccountType == "business"),

	// Eligibility and consent.
	validation.Number("age", req.Age).Min(18),
	validation.Bool("terms", req.Terms).Accepted(),
)
```

```go
var failures *validation.Errors
if errors.As(registrationErr, &failures) {
	fmt.Println(failures.First("email"))
	// Enter a valid email address.

	for _, issue := range failures.Issues() {
		fmt.Println(issue.Path, issue.Code)
	}
	// email email
	// password_confirmation equal
	// company required
	// terms accepted
}
```

## Formats {#formats}

<a id="isemail"></a>

<a id="isurl"></a>

<a id="isuuid"></a>

<a id="isuuidv4"></a>

<a id="isuuidv7"></a>

<a id="isip"></a>

<a id="isipv4"></a>

<a id="isipv6"></a>

<a id="isjson"></a>

<a id="isbase64"></a>

### IsEmail · IsURL · IsUUID · IsUUIDv4 · IsUUIDv7 · IsIP · IsIPv4 · IsIPv6 · IsJSON · IsBase64 {#isemail-isurl-isuuid-isuuidv4-isuuidv7-isip-isipv4-isipv6-isjson-isbase64}

IsEmail requires a bare ASCII mailbox with a dotted domain.

```go
uuidV4 := "550e8400-e29b-41d4-a716-446655440000"
uuidV7 := "0190bde7-5ad0-7000-8000-000000000001"

err := validation.Validate(
	// Contact details.
	validation.String("email", "ada@example.com").IsEmail(),
	validation.String("site", "https://goforj.dev").IsURL(),

	// Request and trace identifiers.
	validation.String("id", uuidV4).IsUUID(),
	validation.String("trace_id", uuidV4).IsUUIDv4(),
	validation.String("request_id", uuidV7).IsUUIDv7(),

	// IP addresses.
	validation.String("host", "::1").IsIP(),
	validation.String("ip", "192.0.2.1").IsIPv4(),
	validation.String("ipv6", "2001:db8::1").IsIPv6(),

	// Structured and encoded values.
	validation.String("metadata", `{"source":"web"}`).IsJSON(),
	validation.String("cursor", "YWJj").IsBase64(),
)

fmt.Println(err)
// <nil>
```

## Conditions {#conditions}

<a id="when"></a>

### When {#when-2}

When evaluates the callback lazily only when condition is true.

```go
return validation.Validate(
	validation.When(req.Email != nil, func() validation.Field {
		return validation.String("email", *req.Email).Required().IsEmail()
	}),
)
```

## Collections {#collections}

<a id="group"></a>

<a id="slice"></a>

<a id="each"></a>

### Group · Slice · Each {#group-slice-each}

Group prefixes child paths with a literal parent label.

```go
items := []Item{
	{SKU: "book", Quantity: 0},
}

err := validation.Validate(
	validation.Group("address",
		validation.String("city", "").Required(),
	),

	validation.Slice("items", items).Required().Max(100).
		Each(func(item Item) []validation.Field {
			return []validation.Field{
				validation.String("sku", item.SKU).Required(),
				validation.Number("quantity", item.Quantity).Min(1),
			}
		}),
)

failures := err.(*validation.Errors)
for _, issue := range failures.Issues() {
	fmt.Println(issue.Path, issue.Code)
}
// address.city required
// items.0.quantity min
```

## Custom rules {#custom-rules}

<a id="using"></a>

<a id="invalid"></a>

### Using · Invalid {#using-invalid}

Using attaches a reusable validator for the exact value type.

```go
// AllowedDomain requires the configured company domain.
type AllowedDomain struct {
	Domain string
}

// Validate rejects addresses outside the company.
func (r AllowedDomain) Validate(value string) error {
	_, domain, ok := strings.Cut(value, "@")
	if !ok || !strings.EqualFold(domain, r.Domain) {
		return validation.Invalid("email_domain", "Use your company email address.")
	}
	return nil
}
```

```go
err := validation.Validate(
	validation.String("email", "ada@other.example").
		Required().
		IsEmail().
		Using(AllowedDomain{Domain: "goforj.dev"}),
)

fmt.Println(err)
// Use your company email address.
```

## Context {#context}

<a id="validatecontext"></a>

<a id="check"></a>

### ValidateContext · Check {#validatecontext-check}

ValidateContext evaluates with request cancellation and the configured collection policy.

```go
unavailable := errors.New("directory unavailable")

err := validation.ValidateContext(
	context.Background(),
	validation.String("email", "ada@example.com").IsEmail().
		Check(func(ctx context.Context, email string) error {
			// A client would use ctx and email.
			return unavailable
		}),
)

fmt.Println(errors.Is(err, unavailable))
// true
```

## Domain values {#domain-values}

<a id="value"></a>

<a id="rulefunc"></a>

<a id="contextrulefunc"></a>

### Value · RuleFunc · ContextRuleFunc {#value-rulefunc-contextrulefunc}

Value starts a deferred chain for a borrowed application value.

```go
window := validation.RuleFunc[Delivery](func(value Delivery) error {
	if value.Days > 30 {
		return validation.Invalid("delivery_window", "Choose delivery within 30 days.")
	}
	return nil
})

available := validation.ContextRuleFunc[Delivery](
	func(ctx context.Context, _ Delivery) error {
		return ctx.Err()
	},
)

err := validation.Validate(
	validation.Value("delivery", Delivery{Days: 7}).Using(window).Using(available),
)

fmt.Println(err)
// <nil>
```

## Errors {#errors}

<a id="label"></a>

<a id="message"></a>

<a id="first"></a>

<a id="messages"></a>

<a id="issues"></a>

### Label · Message · First · Messages · Issues {#label-message-first-messages-issues}

Label sets the human-readable field name without changing its output path.

```go
err := validation.Validate(
	validation.String("email", "bad").
		Label("email address").
		IsEmail().
		Message("Enter your work email address."),
)

var failures *validation.Errors
if errors.As(err, &failures) {
	fmt.Println(failures.First("email"))
	// Enter your work email address.

	fmt.Println(failures.Messages()["email"])
	// [Enter your work email address.]

	fmt.Println(failures.Issues()[0].Code)
	// email
}
```

## Constraints {#constraints}

<a id="required"></a>

<a id="requiredif"></a>

<a id="notblank"></a>

<a id="min"></a>

<a id="max"></a>

<a id="in"></a>

<a id="equal"></a>

<a id="match"></a>

<a id="accepted"></a>

### Required · RequiredIf · NotBlank · Min · Max · In · Equal · Match · Accepted {#required-requiredif-notblank-min-max-in-equal-match-accepted}

Required rejects an empty string before content rules run.

```go
skuPattern := regexp.MustCompile(`^[A-Z]+-\d+$`)

err := validation.Validate(
	validation.String("name", "Ada").Required().NotBlank().Min(2).Max(100),

	validation.String("company", "").RequiredIf(false).Max(200),
	validation.String("role", "member").In("member", "admin"),

	validation.String("confirmation", "correct horse").Equal("correct horse"),
	validation.String("sku", "BOOK-42").Match(skuPattern),

	validation.Number("age", 36).Min(18).Max(120),
	validation.Bool("terms", true).Accepted(),
)

fmt.Println(err)
// <nil>
```

## Text constraints {#text-constraints}

<a id="len"></a>

<a id="contains"></a>

<a id="notcontains"></a>

<a id="startswith"></a>

<a id="endswith"></a>

<a id="notequal"></a>

<a id="notin"></a>

### Len · Contains · NotContains · StartsWith · EndsWith · NotEqual · NotIn {#len-contains-notcontains-startswith-endswith-notequal-notin}

Len requires exactly length Unicode code points.

```go
err := validation.Validate(
	validation.String("sku", "BOOK-42").
		Len(7).Contains("-").NotContains(" ").
		StartsWith("BOOK").EndsWith("42"),

	validation.String("username", "ada").NotEqual("root").NotIn("admin", "system"),
)

fmt.Println(err)
// <nil>
```

## Numeric constraints {#numeric-constraints}

<a id="greaterthan"></a>

<a id="lessthan"></a>

<a id="multipleof"></a>

### GreaterThan · LessThan · MultipleOf {#greaterthan-lessthan-multipleof}

GreaterThan requires a strict lower bound in the field's numeric type.

```go
err := validation.Validate(
	validation.Number("quantity", 12).GreaterThan(0).LessThan(100).MultipleOf(3),
)

fmt.Println(err)
// <nil>
```

## Collection constraints {#collection-constraints}

<a id="map"></a>

<a id="unique"></a>

<a id="uniqueby"></a>

<a id="haskey"></a>

<a id="onlykeys"></a>

### Map · Unique · UniqueBy · HasKey · OnlyKeys {#map-unique-uniqueby-haskey-onlykeys}

Map starts a deferred chain for a borrowed string-keyed map.

```go
// label checks a map value independently of its key.
func label(_ string, value string) []validation.Field {
	return []validation.Field{
		validation.String("", value).NotBlank(),
	}
}
```

```go
products := []Product{{ID: 1}, {ID: 2}}
labels := map[string]string{"category": "books"}

err := validation.Validate(
	validation.Slice("tags", []string{"go", "books"}).Unique().Contains("go"),

	validation.Slice("products", products).
		Using(validation.UniqueBy(func(product Product) int {
			return product.ID
		})),

	validation.Map("labels", labels).
		Required().HasKey("category").OnlyKeys("category").
		Each(label),
)

fmt.Println(err)
// <nil>
```

## Dates and times {#dates-and-times}

<a id="time"></a>

<a id="before"></a>

<a id="after"></a>

<a id="isdate"></a>

<a id="isdatein"></a>

### Time · Before · After · IsDate · IsDateIn {#time-before-after-isdate-isdatein}

Time starts a deferred chain using instant comparisons across time zones.

```go
starts := time.Date(2026, 11, 10, 10, 0, 0, 0, time.UTC)
ends := starts.Add(2 * time.Hour)

err := validation.Validate(
	validation.Time("starts_at", starts).
		Required().
		Before(ends).
		Min(starts).
		Max(ends).
		Equal(starts),

	validation.Time("ends_at", ends).After(starts),

	validation.String("date", "2026-11-10").IsDate(time.DateOnly),
	validation.String("local_time", "2026-11-10 10:00").
		IsDateIn("2006-01-02 15:04", time.UTC),
)

fmt.Println(err)
// <nil>
```

## Optional inputs {#optional-inputs}

<a id="presence"></a>

<a id="nullable"></a>

<a id="optional"></a>

<a id="provided"></a>

<a id="null"></a>

<a id="ispresent"></a>

<a id="isnull"></a>

<a id="get"></a>

### Presence · Nullable · Optional · Provided · Null · IsPresent · IsNull · Get {#presence-nullable-optional-provided-null-ispresent-isnull-get}

Presence defers child validation until input contains a non-null value.
Use an empty child path to retain path, or a named child to append a segment.

```go
// nonBlank reuses a nonblank string rule.
func nonBlank(value string) validation.Field {
	return validation.String("", value).NotBlank()
}
```

```go
var patch struct {
	Seats validation.Input[int]    `json:"seats"`
	Name  validation.Input[string] `json:"name"`
}

payload := []byte(`{"seats":0,"name":null}`)
decodeErr := json.Unmarshal(payload, &patch)
fmt.Println(decodeErr)
// <nil>

err := validation.Validate(
	validation.Presence("seats", patch.Seats, func(value int) validation.Field {
		return validation.Number("", value).Min(0)
	}).Required(),

	validation.Presence("name", patch.Name, nonBlank).Nullable(),
)

fmt.Println(err)
// <nil>

fmt.Println(patch.Seats.IsPresent())
// true

fmt.Println(patch.Name.IsNull())
// true
```

```go
value, present := validation.Provided(false).Get()
fmt.Println(value, present)
// false true

fmt.Println(validation.Null[string]().IsNull())
// true
```

```go
var nickname *string

err := validation.Validate(
	validation.Optional(nickname, nonBlank),
)

fmt.Println(err)
// <nil>

name := "Ada"

err = validation.Validate(
	validation.Optional(&name, nonBlank),
)

fmt.Println(err)
// <nil>
```

## More formats {#more-formats}

<a id="isulid"></a>

<a id="ishostname"></a>

<a id="iscidr"></a>

<a id="ismac"></a>

<a id="ise164"></a>

<a id="isbase64url"></a>

<a id="isalpha"></a>

<a id="isalphanumeric"></a>

<a id="isdigits"></a>

<a id="isascii"></a>

<a id="islowercase"></a>

<a id="isuppercase"></a>

<a id="isutf8"></a>

### IsULID · IsHostname · IsCIDR · IsMAC · IsE164 · IsBase64URL · IsAlpha · IsAlphanumeric · IsDigits · IsASCII · IsLowercase · IsUppercase · IsUTF8 {#isulid-ishostname-iscidr-ismac-ise164-isbase64url-isalpha-isalphanumeric-isdigits-isascii-islowercase-isuppercase-isutf8}

IsULID requires a case-insensitive 128-bit ULID.

```go
err := validation.Validate(
	// Sortable identifiers.
	validation.String("id", "01ARZ3NDEKTSV4RRFFQ69G5FAV").IsULID(),

	// Network names and addresses.
	validation.String("host", "api.example.com").IsHostname(),
	validation.String("network", "192.0.2.0/24").IsCIDR(),
	validation.String("device", "00:11:22:33:44:55").IsMAC(),

	// Phone numbers and URL-safe encoding.
	validation.String("phone", "+14155552671").IsE164(),
	validation.String("token", "__8").IsBase64URL(),

	// Character restrictions.
	validation.String("name", "Ada").IsAlpha(),
	validation.String("sku", "A123").IsAlphanumeric(),
	validation.String("pin", "012345").IsDigits(),
	validation.String("key", "header_name").IsASCII(),

	// Unicode casing and text.
	validation.String("slug", "café").IsLowercase(),
	validation.String("code", "ÉCOLE").IsUppercase(),
	validation.String("title", "こんにちは").IsUTF8(),
)

fmt.Println(err)
// <nil>
```

## Composition {#composition}

<a id="any"></a>

<a id="all"></a>

<a id="not"></a>

### Any · All · Not {#any-all-not}

Any accepts a value when a rule succeeds; operational errors abort evaluation.

```go
startsA := validation.RuleFunc[string](
	func(value string) error {
		if strings.HasPrefix(value, "A") {
			return nil
		}
		return validation.Invalid("starts_a", "Must start with A")
	},
)

endsZ := validation.ContextRuleFunc[string](
	func(_ context.Context, value string) error {
		if strings.HasSuffix(value, "Z") {
			return nil
		}
		return validation.Invalid("ends_z", "Must end with Z")
	},
)

allowedCode := validation.All(
	validation.Any[string](startsA, endsZ),
	validation.Not[string](endsZ),
)
```

```go
err := validation.Validate(
	validation.String("code", "ABC").Using(allowedCode),
)

fmt.Println(err)
// <nil>

err = validation.Validate(
	validation.String("code", "XYZ").
		Using(validation.Any[string](startsA, endsZ)),
)

fmt.Println(err)
// <nil>
```

## Evaluation policy {#evaluation-policy}

<a id="new"></a>

<a id="collectall"></a>

<a id="stoponfirsterror"></a>

<a id="formatmessages"></a>

### New · CollectAll · StopOnFirstError · FormatMessages {#new-collectall-stoponfirsterror-formatmessages}

New creates a validator with first-violation-per-field collection and default messages.

```go
validator := validation.New().
	CollectAll().
	FormatMessages(func(issue validation.Issue) string {
		return issue.Path + ": " + issue.Code
	})

err := validator.Validate(
	validation.String("name", "a").Min(3).Contains("z"),
)

var failures *validation.Errors
if errors.As(err, &failures) {
	fmt.Println(failures.Messages()["name"])
	// [name: min name: contains]
}

first := validator.StopOnFirstError()

err = first.ValidateContext(
	context.Background(),
	validation.String("name", "").Required(),
	validation.Number("age", 0).Min(18),
)

fmt.Println(err)
// name: required
```

## Exact decimals {#exact-decimals}

<a id="decimal"></a>

<a id="maxscale"></a>

### Decimal · MaxScale {#decimal-maxscale}

Decimal starts a deferred chain for signed decimal text without exponent notation.
Values require ASCII integer digits and may include a fractional part with digits after the point.

```go
err := validation.Validate(
	validation.Decimal("amount", request.Amount).
		Required().Min("0.01").Max("999999.99").
		MaxScale(2),
	validation.Currency("currency", request.Currency).Required().USD().EUR(),
)

fmt.Println(err)
// <nil>
```

## Currencies {#currencies}

<a id="currency"></a>

<a id="usd"></a>

<a id="eur"></a>

<a id="gbp"></a>

### Currency · USD · EUR · GBP {#currency-usd-eur-gbp}

Currency starts a deferred currency allowlist, configured with selectors such as USD and EUR.
Select at least one currency before validation; string and defined-string inputs are supported.

```go
err := validation.Validate(
	validation.Currency("currency", request.Currency).Required().USD().EUR().GBP(),
)

fmt.Println(err)
// <nil>
```

See the [complete currency selector list](#currency-selectors).


<a id="currency-selectors"></a>

## Currency selectors {#currency-selectors-2}

Each method adds an accepted currency to the same allowlist.

<details>
<summary>All 178 currency selectors</summary>

| Initial | Selectors |
| :--- | :--- |
| A | .AED() · .AFN() · .ALL() · .AMD() · .AOA() · .ARS() · .AUD() · .AWG() · .AZN() |
| B | .BAM() · .BBD() · .BDT() · .BHD() · .BIF() · .BMD() · .BND() · .BOB() · .BOV() · .BRL() · .BSD() · .BTN() · .BWP() · .BYN() · .BZD() |
| C | .CAD() · .CDF() · .CHE() · .CHF() · .CHW() · .CLF() · .CLP() · .CNY() · .COP() · .COU() · .CRC() · .CUP() · .CVE() · .CZK() |
| D | .DJF() · .DKK() · .DOP() · .DZD() |
| E | .EGP() · .ERN() · .ETB() · .EUR() |
| F | .FJD() · .FKP() |
| G | .GBP() · .GEL() · .GHS() · .GIP() · .GMD() · .GNF() · .GTQ() · .GYD() |
| H | .HKD() · .HNL() · .HTG() · .HUF() |
| I | .IDR() · .ILS() · .INR() · .IQD() · .IRR() · .ISK() |
| J | .JMD() · .JOD() · .JPY() |
| K | .KES() · .KGS() · .KHR() · .KMF() · .KPW() · .KRW() · .KWD() · .KYD() · .KZT() |
| L | .LAK() · .LBP() · .LKR() · .LRD() · .LSL() · .LYD() |
| M | .MAD() · .MDL() · .MGA() · .MKD() · .MMK() · .MNT() · .MOP() · .MRU() · .MUR() · .MVR() · .MWK() · .MXN() · .MXV() · .MYR() · .MZN() |
| N | .NAD() · .NGN() · .NIO() · .NOK() · .NPR() · .NZD() |
| O | .OMR() |
| P | .PAB() · .PEN() · .PGK() · .PHP() · .PKR() · .PLN() · .PYG() |
| Q | .QAR() |
| R | .RON() · .RSD() · .RUB() · .RWF() |
| S | .SAR() · .SBD() · .SCR() · .SDG() · .SEK() · .SGD() · .SHP() · .SLE() · .SOS() · .SRD() · .SSP() · .STN() · .SVC() · .SYP() · .SZL() |
| T | .THB() · .TJS() · .TMT() · .TND() · .TOP() · .TRY() · .TTD() · .TWD() · .TZS() |
| U | .UAH() · .UGX() · .USD() · .USN() · .UYI() · .UYU() · .UYW() · .UZS() |
| V | .VED() · .VES() · .VND() · .VUV() |
| W | .WST() |
| X | .XAD() · .XAF() · .XAG() · .XAU() · .XBA() · .XBB() · .XBC() · .XBD() · .XCD() · .XCG() · .XDR() · .XOF() · .XPD() · .XPF() · .XPT() · .XSU() · .XTS() · .XUA() · .XXX() |
| Y | .YER() |
| Z | .ZAR() · .ZMW() · .ZWG() |

</details>

## Development {#development}

```sh
make test
make test-race
make vet
make test-coverage
make generate
make check-generated
```

The root module contains the library and executable examples. The separate docs module contains documentation tooling. See [development](https://github.com/goforj/validation/blob/main/docs/development.md) for checks and [validation contracts](https://github.com/goforj/validation/blob/main/docs/contracts.md) for API behavior.

The [initial release review](https://github.com/goforj/validation/blob/main/docs/release-readiness.md) records the review passes, fixes, and verification evidence.
