---
title: Strings
---

<p align="center">
  <img src="https://raw.githubusercontent.com/goforj/str/main/docs/images/logo.png?v=2" width="400" alt="str logo">
</p>

<p align="center">
    A fluent, Laravel-inspired string toolkit for Go, focused on rune-safe helpers,
    expressive transformations, and predictable behavior beyond the standard library.
</p>

<p align="center">
    <a href="https://pkg.go.dev/github.com/goforj/str"><img src="https://pkg.go.dev/badge/github.com/goforj/str.svg" alt="Go Reference"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
    <a href="https://github.com/goforj/str/actions"><img src="https://github.com/goforj/str/actions/workflows/test.yml/badge.svg" alt="Go Test"></a>
    <a href="https://golang.org"><img src="https://img.shields.io/badge/go-1.18+-blue?logo=go" alt="Go version"></a>
    <img src="https://img.shields.io/github/v/tag/goforj/str?label=version&sort=semver" alt="Latest tag">
    <a href="https://codecov.io/gh/goforj/str" ><img src="https://codecov.io/github/goforj/str/graph/badge.svg?token=9KT46ZORP3"/></a>
<!-- test-count:embed:start -->
    <img src="https://img.shields.io/badge/tests-196-brightgreen" alt="Tests">
<!-- test-count:embed:end -->
    <a href="https://goreportcard.com/report/github.com/goforj/str"><img src="https://goreportcard.com/badge/github.com/goforj/str" alt="Go Report Card"></a>
</p>

## Installation {#installation}

```sh
go get github.com/goforj/str
```

## Runnable examples {#runnable-examples}

Every function has a corresponding runnable example under [`./examples`](./examples).

These examples are **generated directly from the documentation blocks** of each function, ensuring the docs and code never drift. These are the same examples you see here in the README and GoDoc.

An automated test executes **every example** to verify it builds and runs successfully.

This guarantees all examples are valid, up-to-date, and remain functional as the API evolves.

<!-- api:embed:start -->

## API Index {#api-index}

| Group | Functions |
|------:|-----------|
| **Affixes** | [ChopEnd](#chopend) [ChopStart](#chopstart) [EnsurePrefix](#ensureprefix) [EnsureSuffix](#ensuresuffix) [Unwrap](#unwrap) [Wrap](#wrap) |
| **Case** | [Camel](#camel) [Headline](#headline) [Kebab](#kebab) [LcFirst](#lcfirst) [Pascal](#pascal) [Snake](#snake) [Title](#title) [ToLower](#tolower) [ToTitle](#totitle) [ToUpper](#toupper) [UcFirst](#ucfirst) [UcWords](#ucwords) |
| **Checks** | [IsASCII](#isascii) [IsBlank](#isblank) [IsEmpty](#isempty) |
| **Cleanup** | [Deduplicate](#deduplicate) [NormalizeNewlines](#normalizenewlines) [NormalizeSpace](#normalizespace) [Squish](#squish) [Trim](#trim) [TrimLeft](#trimleft) [TrimRight](#trimright) [TrimSpace](#trimspace) |
| **Comparison** | [Equals](#equals) [EqualsFold](#equalsfold) |
| **Compose** | [Append](#append) [NewLine](#newline) [Prepend](#prepend) |
| **Constructor** | [Of](#of) |
| **Encoding** | [FromBase64](#frombase64) [ToBase64](#tobase64) |
| **Fluent** | [GoString](#gostring) [String](#string) |
| **Length** | [Len](#len) [RuneCount](#runecount) |
| **Masking** | [Mask](#mask) |
| **Match** | [Is](#is) [IsMatch](#ismatch) [Match](#match) [MatchAll](#matchall) |
| **Padding** | [PadBoth](#padboth) [PadLeft](#padleft) [PadRight](#padright) |
| **Pluralize** | [Plural](#plural) [Singular](#singular) |
| **Replace** | [Remove](#remove) [ReplaceAll](#replaceall) [ReplaceArray](#replacearray) [ReplaceEnd](#replaceend) [ReplaceFirst](#replacefirst) [ReplaceFirstFold](#replacefirstfold) [ReplaceFold](#replacefold) [ReplaceLast](#replacelast) [ReplaceLastFold](#replacelastfold) [ReplaceMatches](#replacematches) [ReplaceStart](#replacestart) [Swap](#swap) |
| **Search** | [Contains](#contains) [ContainsAll](#containsall) [ContainsAllFold](#containsallfold) [ContainsFold](#containsfold) [Count](#count) [EndsWith](#endswith) [EndsWithFold](#endswithfold) [Index](#index) [LastIndex](#lastindex) [StartsWith](#startswith) [StartsWithFold](#startswithfold) |
| **Slug** | [Slug](#slug) |
| **Snippet** | [Excerpt](#excerpt) |
| **Split** | [Lines](#lines) [Split](#split) [UcSplit](#ucsplit) |
| **Substrings** | [After](#after) [AfterLast](#afterlast) [Before](#before) [BeforeLast](#beforelast) [Between](#between) [BetweenFirst](#betweenfirst) [CharAt](#charat) [Limit](#limit) [Slice](#slice) [SubstrReplace](#substrreplace) [Take](#take) [TakeLast](#takelast) |
| **Transform** | [Repeat](#repeat) [Reverse](#reverse) [Transliterate](#transliterate) |
| **Words** | [FirstWord](#firstword) [Join](#join) [LastWord](#lastword) [SplitWords](#splitwords) [WordCount](#wordcount) [Words](#words) [WrapWords](#wrapwords) |


## Affixes {#affixes}

### ChopEnd {#chopend}

ChopEnd removes the first matching suffix if present.

<GoForjExample repo="str" example="chopend">

```go
// Example: chop end
v := str.Of("file.txt").ChopEnd(".txt", ".md").String()
println(v)
// #string file
```

</GoForjExample>

### ChopStart {#chopstart}

ChopStart removes the first matching prefix if present.

<GoForjExample repo="str" example="chopstart">

```go
// Example: chop start
v := str.Of("https://goforj.dev").ChopStart("https://", "http://").String()
println(v)
// #string goforj.dev
```

</GoForjExample>

### EnsurePrefix {#ensureprefix}

EnsurePrefix ensures the string starts with prefix, adding it if missing.

<GoForjExample repo="str" example="ensureprefix">

```go
// Example: ensure prefix
v := str.Of("path/to").EnsurePrefix("/").String()
println(v)
// #string /path/to
```

</GoForjExample>

### EnsureSuffix {#ensuresuffix}

EnsureSuffix ensures the string ends with suffix, adding it if missing.

<GoForjExample repo="str" example="ensuresuffix">

```go
// Example: ensure suffix
v := str.Of("path/to").EnsureSuffix("/").String()
println(v)
// #string path/to/
```

</GoForjExample>

### Unwrap {#unwrap}

Unwrap removes matching before and after strings if present.

<GoForjExample repo="str" example="unwrap">

```go
// Example: unwrap string
v := str.Of(`"GoForj"`).Unwrap(`"`, `"`).String()
println(v)
// #string GoForj
```

</GoForjExample>

### Wrap {#wrap}

Wrap surrounds the string with before and after (after defaults to before).

<GoForjExample repo="str" example="wrap">

```go
// Example: wrap string
v := str.Of("GoForj").Wrap(`"`, "").String()
println(v)
// #string "GoForj"
```

</GoForjExample>

## Case {#case}

### Camel {#camel}

Camel converts the string to camelCase.

<GoForjExample repo="str" example="camel">

```go
// Example: camel case
v := str.Of("foo_bar baz").Camel().String()
println(v)
// #string fooBarBaz
```

</GoForjExample>

### Headline {#headline}

Headline converts the string into a human-friendly headline:
splits on case/underscores/dashes/whitespace, title-cases words, and lowercases small words (except the first).

<GoForjExample repo="str" example="headline">

```go
// Example: headline
v := str.Of("emailNotification_sent").Headline().String()
println(v)
// #string Email Notification Sent
```

</GoForjExample>

### Kebab {#kebab}

Kebab converts the string to kebab-case.

<GoForjExample repo="str" example="kebab">

```go
// Example: kebab case
v := str.Of("fooBar baz").Kebab().String()
println(v)
// #string foo-bar-baz
```

</GoForjExample>

### LcFirst {#lcfirst}

LcFirst returns the string with the first rune lower-cased.

<GoForjExample repo="str" example="lcfirst">

```go
// Example: lowercase first rune
v := str.Of("Gopher").LcFirst().String()
fmt.Println(v)
// #string gopher
```

</GoForjExample>

### Pascal {#pascal}

Pascal converts the string to PascalCase.

<GoForjExample repo="str" example="pascal">

```go
// Example: pascal case
v := str.Of("foo_bar baz").Pascal().String()
fmt.Println(v)
// #string FooBarBaz
```

</GoForjExample>

### Snake {#snake}

Snake converts the string to snake_case using the provided separator (default "_").

<GoForjExample repo="str" example="snake">

```go
// Example: snake case
v := str.Of("fooBar baz").Snake("_").String()
println(v)
// #string foo_bar_baz
```

</GoForjExample>

### Title {#title}

Title converts the string to title case (first letter of each word upper, rest lower) using Unicode rules.

<GoForjExample repo="str" example="title">

```go
// Example: title case words
v := str.Of("a nice title uses the correct case").Title().String()
println(v)
// #string A Nice Title Uses The Correct Case
```

</GoForjExample>

### ToLower {#tolower}

ToLower returns a lowercase copy of the string using Unicode rules.

<GoForjExample repo="str" example="tolower">

```go
// Example: lowercase text
v := str.Of("GoLang").ToLower().String()
println(v)
// #string golang
```

</GoForjExample>

### ToTitle {#totitle}

ToTitle returns a title-cased copy where all letters are mapped using Unicode title case.

<GoForjExample repo="str" example="totitle">

```go
// Example: title map runes
v := str.Of("ß").ToTitle().String()
println(v)
// #string SS
```

</GoForjExample>

### ToUpper {#toupper}

ToUpper returns an uppercase copy of the string using Unicode rules.

<GoForjExample repo="str" example="toupper">

```go
// Example: uppercase text
v := str.Of("GoLang").ToUpper().String()
println(v)
// #string GOLANG
```

</GoForjExample>

### UcFirst {#ucfirst}

UcFirst returns the string with the first rune upper-cased.

<GoForjExample repo="str" example="ucfirst">

```go
// Example: uppercase first rune
v := str.Of("gopher").UcFirst().String()
println(v)
// #string Gopher
```

</GoForjExample>

### UcWords {#ucwords}

UcWords uppercases the first rune of each word, leaving the rest unchanged.
Words are sequences of letters/digits.

<GoForjExample repo="str" example="ucwords">

```go
// Example: uppercase each word start
v := str.Of("hello WORLD").UcWords().String()
println(v)
// #string Hello WORLD
```

</GoForjExample>

## Checks {#checks}

### IsASCII {#isascii}

IsASCII reports whether the string consists solely of 7-bit ASCII runes.

<GoForjExample repo="str" example="isascii">

```go
// Example: ASCII check
v := str.Of("gopher").IsASCII()
println(v)
// #bool true
```

</GoForjExample>

### IsBlank {#isblank}

IsBlank reports whether the string contains only Unicode whitespace.

<GoForjExample repo="str" example="isblank">

```go
// Example: blank check
v := str.Of("  \\t\\n")
println(v.IsBlank())
// #bool true
```

</GoForjExample>

### IsEmpty {#isempty}

IsEmpty reports whether the string has zero length.

<GoForjExample repo="str" example="isempty">

```go
// Example: empty check
v := str.Of("").IsEmpty()
println(v)
// #bool true
```

</GoForjExample>

## Cleanup {#cleanup}

### Deduplicate {#deduplicate}

Deduplicate collapses consecutive instances of char into a single instance.
If char is zero, space is used.

<GoForjExample repo="str" example="deduplicate">

```go
// Example: collapse spaces
v := str.Of("The   Go   Playground").Deduplicate(' ').String()
println(v)
// #string The Go Playground
```

</GoForjExample>

### NormalizeNewlines {#normalizenewlines}

NormalizeNewlines replaces CRLF, CR, and Unicode separators with \n.

<GoForjExample repo="str" example="normalizenewlines">

```go
// Example: normalize newline variants
v := str.Of("a\\r\\nb\\u2028c").NormalizeNewlines().String()
println(v)
// #string a\nb\nc
```

</GoForjExample>

### NormalizeSpace {#normalizespace}

NormalizeSpace collapses whitespace runs to single spaces without trimming ends.

<GoForjExample repo="str" example="normalizespace">

```go
// Example: normalize interior space
v := str.Of("  go   forj  ").NormalizeSpace().String()
println(v)
// #string  go forj 
```

</GoForjExample>

### Squish {#squish}

Squish trims leading/trailing whitespace and collapses internal whitespace to single spaces.

<GoForjExample repo="str" example="squish">

```go
// Example: squish whitespace
v := str.Of("   go   forj  ").Squish().String()
println(v)
// #string go forj
```

</GoForjExample>

### Trim {#trim}

Trim trims leading and trailing characters. If cutset is the zero value (empty string), trims Unicode whitespace.

<GoForjExample repo="str" example="trim">

```go
// Example: trim whitespace
v := str.Of("  GoForj  ").Trim("").String()
println(v)
// #string GoForj
```

</GoForjExample>

### TrimLeft {#trimleft}

TrimLeft trims leading characters. If cutset is the zero value (empty string), trims Unicode whitespace.

<GoForjExample repo="str" example="trimleft">

```go
// Example: trim left
v := str.Of("  GoForj  ").TrimLeft("").String()
println(v)
// #string GoForj
```

</GoForjExample>

### TrimRight {#trimright}

TrimRight trims trailing characters. If cutset is the zero value (empty string), trims Unicode whitespace.

<GoForjExample repo="str" example="trimright">

```go
// Example: trim right
v := str.Of("  GoForj  ").TrimRight("").String()
println(v)
// #string   GoForj
```

</GoForjExample>

### TrimSpace {#trimspace}

TrimSpace trims leading and trailing Unicode whitespace.

<GoForjExample repo="str" example="trimspace">

```go
// Example: trim space
v := str.Of("  GoForj  ").TrimSpace().String()
println(v)
// #string GoForj
```

</GoForjExample>

## Comparison {#comparison}

### Equals {#equals}

Equals reports whether the string exactly matches other (case-sensitive).

<GoForjExample repo="str" example="equals">

```go
// Example: exact match
v := str.Of("gopher").Equals("gopher")
println(v)
// #bool true
```

</GoForjExample>

### EqualsFold {#equalsfold}

EqualsFold reports whether the string matches other using Unicode case folding.

<GoForjExample repo="str" example="equalsfold">

```go
// Example: case-insensitive match
v := str.Of("gopher").EqualsFold("GOPHER")
println(v)
// #bool true
```

</GoForjExample>

## Compose {#compose}

### Append {#append}

Append concatenates the provided parts to the end of the string.

<GoForjExample repo="str" example="append">

```go
// Example: append text
v := str.Of("Go").Append("Forj", "!").String()
println(v)
// #string GoForj!
```

</GoForjExample>

### NewLine {#newline}

NewLine appends a newline character to the string.

<GoForjExample repo="str" example="newline">

```go
// Example: append newline
v := str.Of("hello").NewLine().Append("world").String()
println(v)
// #string hello\nworld
```

</GoForjExample>

### Prepend {#prepend}

Prepend concatenates the provided parts to the beginning of the string.

<GoForjExample repo="str" example="prepend">

```go
// Example: prepend text
v := str.Of("World").Prepend("Hello ", "Go ").String()
println(v)
// #string Hello Go World
```

</GoForjExample>

## Constructor {#constructor}

### Of {#of}

Of wraps a raw string with fluent helpers.

<GoForjExample repo="str" example="of">

```go
// Example: wrap raw string
v := str.Of("gopher")
println(v.String())
// #string gopher
```

</GoForjExample>

## Encoding {#encoding}

### FromBase64 {#frombase64}

FromBase64 decodes a standard Base64 string.

<GoForjExample repo="str" example="frombase64">

```go
// Example: base64 decode
v, err := str.Of("Z29waGVy").FromBase64()
println(v.String(), err)
// #string gopher
// #error <nil>
```

</GoForjExample>

### ToBase64 {#tobase64}

ToBase64 encodes the string using standard Base64.

<GoForjExample repo="str" example="tobase64">

```go
// Example: base64 encode
v := str.Of("gopher").ToBase64().String()
println(v)
// #string Z29waGVy
```

</GoForjExample>

## Fluent {#fluent}

### GoString {#gostring}

GoString allows %#v formatting to print the raw string.

<GoForjExample repo="str" example="gostring">

```go
// Example: fmt %#v uses GoString
v := str.Of("go")
println(fmt.Sprintf("%#v", v))
// #string go
```

</GoForjExample>

### String {#string}

String returns the underlying raw string value.

<GoForjExample repo="str" example="string">

```go
// Example: unwrap to plain string
v := str.Of("go").String()
println(v)
// #string go
```

</GoForjExample>

## Length {#length}

### Len {#len}

Len returns the number of runes in the string.

<GoForjExample repo="str" example="len">

```go
// Example: count runes instead of bytes
v := str.Of("gophers 🦫").Len()
println(v)
// #int 9
```

</GoForjExample>

### RuneCount {#runecount}

RuneCount is an alias for Len to make intent explicit in mixed codebases.

<GoForjExample repo="str" example="runecount">

```go
// Example: alias for Len
v := str.Of("naïve").RuneCount()
println(v)
// #int 5
```

</GoForjExample>

## Masking {#masking}

### Mask {#mask}

Mask replaces the middle of the string with the given rune, revealing revealLeft runes
at the start and revealRight runes at the end. Negative reveal values count from the end.
If the reveal counts cover the whole string, the original string is returned.

<GoForjExample repo="str" example="mask">

```go
// Example: mask email
v := str.Of("gopher@example.com").Mask('*', 3, 4).String()
println(v)
// #string gop***********.com
```

</GoForjExample>

## Match {#match}

### Is {#is}

Is reports whether the string matches any of the provided wildcard patterns.
Patterns use '*' as a wildcard. Case-sensitive.

<GoForjExample repo="str" example="is">

```go
// Example: wildcard match
v := str.Of("foo/bar").Is("foo/*")
println(v)
// #bool true
```

</GoForjExample>

### IsMatch {#ismatch}

IsMatch reports whether the string matches the provided regular expression.

<GoForjExample repo="str" example="ismatch">

```go
// Example: regex match
v := str.Of("abc123").IsMatch(regexp.MustCompile(`\d+`))
println(v)
// #bool true
```

</GoForjExample>

### Match {#match-2}

Match returns the first match and submatches for the pattern.

<GoForjExample repo="str" example="match">

```go
// Example: regex match
re := regexp.MustCompile(`g(o+)`)
v := str.Of("gooo").Match(re)
println(v)
// #[]string [gooo ooo]
```

</GoForjExample>

### MatchAll {#matchall}

MatchAll returns all matches and submatches for the pattern.

<GoForjExample repo="str" example="matchall">

```go
// Example: regex match all
re := regexp.MustCompile(`go+`)
v := str.Of("go gopher gooo").MatchAll(re)
println(v)
// #[][]string [[go] [gooo]]
```

</GoForjExample>

## Padding {#padding}

### PadBoth {#padboth}

PadBoth pads the string on both sides to reach length runes using pad (defaults to space).

<GoForjExample repo="str" example="padboth">

```go
// Example: pad both
v := str.Of("go").PadBoth(6, "-").String()
println(v)
// #string --go--
```

</GoForjExample>

### PadLeft {#padleft}

PadLeft pads the string on the left to reach length runes using pad (defaults to space).

<GoForjExample repo="str" example="padleft">

```go
// Example: pad left
v := str.Of("go").PadLeft(5, " ").String()
println(v)
// #string \u00a0\u00a0\u00a0go
```

</GoForjExample>

### PadRight {#padright}

PadRight pads the string on the right to reach length runes using pad (defaults to space).

<GoForjExample repo="str" example="padright">

```go
// Example: pad right
v := str.Of("go").PadRight(5, ".").String()
println(v)
// #string go...
```

</GoForjExample>

## Pluralize {#pluralize}

### Plural {#plural}

Plural returns a best-effort English plural form of the last word.

<GoForjExample repo="str" example="plural">

```go
// Example: pluralize word
v := str.Of("city").Plural().String()
println(v)
// #string cities
```

</GoForjExample>

### Singular {#singular}

Singular returns a best-effort English singular form of the last word.

<GoForjExample repo="str" example="singular">

```go
// Example: singularize word
v := str.Of("people").Singular().String()
println(v)
// #string person
```

</GoForjExample>

## Replace {#replace}

### Remove {#remove}

Remove deletes all occurrences of provided substrings.

<GoForjExample repo="str" example="remove">

```go
// Example: remove substrings
v := str.Of("The Go Toolkit").Remove("Go ").String()
println(v)
// #string The Toolkit
```

</GoForjExample>

### ReplaceAll {#replaceall}

ReplaceAll replaces all occurrences of old with new in the string.
If old is empty, the original string is returned unchanged.

<GoForjExample repo="str" example="replaceall">

```go
// Example: replace all occurrences
v := str.Of("go gopher go").ReplaceAll("go", "Go").String()
println(v)
// #string Go Gopher Go
```

</GoForjExample>

### ReplaceArray {#replacearray}

ReplaceArray replaces all occurrences of each old in olds with repl.

<GoForjExample repo="str" example="replacearray">

```go
// Example: replace many
v := str.Of("The---Go---Toolkit")
println(v.ReplaceArray([]string{"---"}, "-").String())
// #string The-Go-Toolkit
```

</GoForjExample>

### ReplaceEnd {#replaceend}

ReplaceEnd replaces old with repl at the end of the string, if present.

<GoForjExample repo="str" example="replaceend">

```go
// Example: replace suffix
v := str.Of("file.old").ReplaceEnd(".old", ".new").String()
println(v)
// #string file.new
```

</GoForjExample>

### ReplaceFirst {#replacefirst}

ReplaceFirst replaces the first occurrence of old with repl.

<GoForjExample repo="str" example="replacefirst">

```go
// Example: replace first
v := str.Of("gopher gopher").ReplaceFirst("gopher", "go").String()
println(v)
// #string go gopher
```

</GoForjExample>

### ReplaceFirstFold {#replacefirstfold}

ReplaceFirstFold replaces the first occurrence of old with repl using Unicode case folding.

<GoForjExample repo="str" example="replacefirstfold">

```go
// Example: replace first (case-insensitive)
v := str.Of("go gopher GO").ReplaceFirstFold("GO", "Go").String()
println(v)
// #string Go gopher GO
```

</GoForjExample>

### ReplaceFold {#replacefold}

ReplaceFold replaces all occurrences of old with repl using Unicode case folding.

<GoForjExample repo="str" example="replacefold">

```go
// Example: replace all (case-insensitive)
v := str.Of("go gopher GO").ReplaceFold("GO", "Go").String()
println(v)
// #string Go Gopher Go
```

</GoForjExample>

### ReplaceLast {#replacelast}

ReplaceLast replaces the last occurrence of old with repl.

<GoForjExample repo="str" example="replacelast">

```go
// Example: replace last
v := str.Of("gopher gopher").ReplaceLast("gopher", "go").String()
println(v)
// #string gopher go
```

</GoForjExample>

### ReplaceLastFold {#replacelastfold}

ReplaceLastFold replaces the last occurrence of old with repl using Unicode case folding.

<GoForjExample repo="str" example="replacelastfold">

```go
// Example: replace last (case-insensitive)
v := str.Of("go gopher GO").ReplaceLastFold("GO", "Go").String()
println(v)
// #string go gopher Go
```

</GoForjExample>

### ReplaceMatches {#replacematches}

ReplaceMatches applies repl to each regex match and returns the result.

<GoForjExample repo="str" example="replacematches">

```go
// Example: regex replace with callback
re := regexp.MustCompile(`\d+`)
v := str.Of("Hello 123 World").ReplaceMatches(re, func(m string) string { return "[" + m + "]" }).String()
println(v)
// #string Hello [123] World
```

</GoForjExample>

### ReplaceStart {#replacestart}

ReplaceStart replaces old with repl at the start of the string, if present.

<GoForjExample repo="str" example="replacestart">

```go
// Example: replace prefix
v := str.Of("prefix-value").ReplaceStart("prefix-", "new-").String()
println(v)
// #string new-value
```

</GoForjExample>

### Swap {#swap}

Swap replaces multiple values using strings.Replacer built from a map.

<GoForjExample repo="str" example="swap">

```go
// Example: swap map
pairs := map[string]string{"Gophers": "GoForj", "are": "is", "great": "fantastic"}
v := str.Of("Gophers are great!").Swap(pairs).String()
println(v)
// #string GoForj is fantastic!
```

</GoForjExample>

## Search {#search}

### Contains {#contains}

Contains reports whether the string contains any of the provided substrings (case-sensitive).
Empty substrings return true to match strings.Contains semantics.

<GoForjExample repo="str" example="contains">

```go
// Example: contains any
v := str.Of("Go means gophers").Contains("rust", "gopher")
println(v)
// #bool true
```

</GoForjExample>

### ContainsAll {#containsall}

ContainsAll reports whether the string contains all provided substrings (case-sensitive).
Empty substrings are ignored.

<GoForjExample repo="str" example="containsall">

```go
// Example: contains all
v := str.Of("Go means gophers").ContainsAll("Go", "gopher")
println(v)
// #bool true
```

</GoForjExample>

### ContainsAllFold {#containsallfold}

ContainsAllFold reports whether the string contains all provided substrings, using Unicode
case folding for comparisons.
Empty substrings are ignored.

<GoForjExample repo="str" example="containsallfold">

```go
// Example: contains all (case-insensitive)
v := str.Of("Go means gophers").ContainsAllFold("go", "GOPHER")
println(v)
// #bool true
```

</GoForjExample>

### ContainsFold {#containsfold}

ContainsFold reports whether the string contains any of the provided substrings, using Unicode
case folding for comparisons.
Empty substrings return true.

<GoForjExample repo="str" example="containsfold">

```go
// Example: contains any (case-insensitive)
v := str.Of("Go means gophers").ContainsFold("GOPHER", "rust")
println(v)
// #bool true
```

</GoForjExample>

### Count {#count}

Count returns the number of non-overlapping occurrences of sub.

<GoForjExample repo="str" example="count">

```go
// Example: count substring
v := str.Of("gogophergo").Count("go")
println(v)
// #int 3
```

</GoForjExample>

### EndsWith {#endswith}

EndsWith reports whether the string ends with any of the provided suffixes (case-sensitive).

<GoForjExample repo="str" example="endswith">

```go
// Example: ends with any
v := str.Of("gopher").EndsWith("her", "cat")
println(v)
// #bool true
```

</GoForjExample>

### EndsWithFold {#endswithfold}

EndsWithFold reports whether the string ends with any of the provided suffixes using Unicode case folding.

<GoForjExample repo="str" example="endswithfold">

```go
// Example: ends with (case-insensitive)
v := str.Of("gopher").EndsWithFold("HER")
println(v)
// #bool true
```

</GoForjExample>

### Index {#index}

Index returns the rune index of the first occurrence of sub, or -1 if not found.

<GoForjExample repo="str" example="index">

```go
// Example: first rune index
v := str.Of("héllo").Index("llo")
println(v)
// #int 2
```

</GoForjExample>

### LastIndex {#lastindex}

LastIndex returns the rune index of the last occurrence of sub, or -1 if not found.

<GoForjExample repo="str" example="lastindex">

```go
// Example: last rune index
v := str.Of("go gophers go").LastIndex("go")
println(v)
// #int 10
```

</GoForjExample>

### StartsWith {#startswith}

StartsWith reports whether the string starts with any of the provided prefixes (case-sensitive).

<GoForjExample repo="str" example="startswith">

```go
// Example: starts with any
v := str.Of("gopher").StartsWith("go", "rust")
println(v)
// #bool true
```

</GoForjExample>

### StartsWithFold {#startswithfold}

StartsWithFold reports whether the string starts with any of the provided prefixes using Unicode case folding.

<GoForjExample repo="str" example="startswithfold">

```go
// Example: starts with (case-insensitive)
v := str.Of("gopher").StartsWithFold("GO")
println(v)
// #bool true
```

</GoForjExample>

## Slug {#slug}

### Slug {#slug-2}

Slug produces an ASCII slug using the provided separator (default "-"), stripping accents where possible.
Not locale-aware; intended for identifiers/URLs.

<GoForjExample repo="str" example="slug">

```go
// Example: build slug
v := str.Of("Go Forj Toolkit").Slug("-").String()
println(v)
// #string go-forj-toolkit
```

</GoForjExample>

## Snippet {#snippet}

### Excerpt {#excerpt}

Excerpt returns a snippet around the first occurrence of needle with the given radius.
If needle is not found, an empty string is returned. If radius <= 0, a default of 100 is used.
Omission is used at the start/end when text is trimmed (default "...").

<GoForjExample repo="str" example="excerpt">

```go
// Example: excerpt with radius
v := str.Of("This is my name").Excerpt("my", 3, "...")
println(v.String())
// #string ...is my na...
```

</GoForjExample>

## Split {#split}

### Lines {#lines}

Lines splits the string into lines after normalizing newline variants.

<GoForjExample repo="str" example="lines">

```go
// Example: split lines
v := str.Of("a\\r\\nb\\nc").Lines()
println(v)
// #[]string [a b c]
```

</GoForjExample>

### Split {#split-2}

Split splits the string by the given separator.

<GoForjExample repo="str" example="split">

```go
// Example: split on comma
v := str.Of("a,b,c").Split(",")
println(v)
// #[]string [a b c]
```

</GoForjExample>

### UcSplit {#ucsplit}

UcSplit splits the string on uppercase boundaries and delimiters, returning segments.

<GoForjExample repo="str" example="ucsplit">

```go
// Example: split on upper-case boundaries
v := str.Of("HTTPRequestID").UcSplit()
println(v)
// #[]string [HTTP Request ID]
```

</GoForjExample>

## Substrings {#substrings}

### After {#after}

After returns the substring after the first occurrence of sep.
If sep is empty or not found, the original string is returned.

<GoForjExample repo="str" example="after">

```go
// Example: slice after marker
v := str.Of("gopher::go").After("::").String()
println(v)
// #string go
```

</GoForjExample>

### AfterLast {#afterlast}

AfterLast returns the substring after the last occurrence of sep.
If sep is empty or not found, the original string is returned.

<GoForjExample repo="str" example="afterlast">

```go
// Example: slice after last separator
v := str.Of("pkg/path/file.txt").AfterLast("/").String()
println(v)
// #string file.txt
```

</GoForjExample>

### Before {#before}

Before returns the substring before the first occurrence of sep.
If sep is empty or not found, the original string is returned.

<GoForjExample repo="str" example="before">

```go
// Example: slice before marker
v := str.Of("gopher::go").Before("::").String()
println(v)
// #string gopher
```

</GoForjExample>

### BeforeLast {#beforelast}

BeforeLast returns the substring before the last occurrence of sep.
If sep is empty or not found, the original string is returned.

<GoForjExample repo="str" example="beforelast">

```go
// Example: slice before last separator
v := str.Of("pkg/path/file.txt").BeforeLast("/").String()
println(v)
// #string pkg/path
```

</GoForjExample>

### Between {#between}

Between returns the substring between the first occurrence of start and the last occurrence of end.
Returns an empty string if either marker is missing or overlapping.

<GoForjExample repo="str" example="between">

```go
// Example: between first and last
v := str.Of("This is my name").Between("This", "name").String()
println(v)
// #string  is my
```

</GoForjExample>

### BetweenFirst {#betweenfirst}

BetweenFirst returns the substring between the first occurrence of start and the first occurrence of end after it.
Returns an empty string if markers are missing.

<GoForjExample repo="str" example="betweenfirst">

```go
// Example: minimal span between markers
v := str.Of("[a] bc [d]").BetweenFirst("[", "]").String()
println(v)
// #string a
```

</GoForjExample>

### CharAt {#charat}

CharAt returns the rune at the given index and true if within bounds.

<GoForjExample repo="str" example="charat">

```go
// Example: rune lookup
v, ok := str.Of("gopher").CharAt(2)
println(string(v), ok)
// #string p
// #bool true
```

</GoForjExample>

### Limit {#limit}

Limit truncates the string to length runes, appending suffix if truncation occurs.

<GoForjExample repo="str" example="limit">

```go
// Example: limit with suffix
v := str.Of("Perfectly balanced, as all things should be.").Limit(10, "...").String()
println(v)
// #string Perfectly...
```

</GoForjExample>

### Slice {#slice}

Slice returns the substring between rune offsets [start:end).
Indices are clamped; if start >= end the result is empty.

<GoForjExample repo="str" example="slice">

```go
// Example: rune-safe slice
v := str.Of("naïve café").Slice(3, 7).String()
println(v)
// #string e ca
```

</GoForjExample>

### SubstrReplace {#substrreplace}

SubstrReplace replaces the rune slice in [start:end) with repl.

<GoForjExample repo="str" example="substrreplace">

```go
// Example: replace range
v := str.Of("naïve café").SubstrReplace("i", 2, 3).String()
println(v)
// #string naive café
```

</GoForjExample>

### Take {#take}

Take returns the first length runes of the string (clamped).

<GoForjExample repo="str" example="take">

```go
// Example: take head
v := str.Of("gophers").Take(3).String()
println(v)
// #string gop
```

</GoForjExample>

### TakeLast {#takelast}

TakeLast returns the last length runes of the string (clamped).

<GoForjExample repo="str" example="takelast">

```go
// Example: take tail
v := str.Of("gophers").TakeLast(4).String()
println(v)
// #string hers
```

</GoForjExample>

## Transform {#transform}

### Repeat {#repeat}

Repeat repeats the string count times (non-negative).

<GoForjExample repo="str" example="repeat">

```go
// Example: repeat string
v := str.Of("go").Repeat(3).String()
println(v)
// #string gogogo
```

</GoForjExample>

### Reverse {#reverse}

Reverse returns a rune-safe reversed string.

<GoForjExample repo="str" example="reverse">

```go
// Example: reverse
v := str.Of("naïve").Reverse().String()
println(v)
// #string evïan
```

</GoForjExample>

### Transliterate {#transliterate}

Transliterate replaces a small set of accented runes with ASCII equivalents.

<GoForjExample repo="str" example="transliterate">

```go
// Example: strip accents
v := str.Of("café déjà vu").Transliterate().String()
println(v)
// #string cafe deja vu
```

</GoForjExample>

## Words {#words}

### FirstWord {#firstword}

FirstWord returns the first word token or empty string.

<GoForjExample repo="str" example="firstword">

```go
// Example: first word
v := str.Of("Hello world")
println(v.FirstWord().String())
// #string Hello
```

</GoForjExample>

### Join {#join}

Join joins the provided words with sep.

<GoForjExample repo="str" example="join">

```go
// Example: join words
v := str.Of("unused").Join([]string{"foo", "bar"}, "-").String()
println(v)
// #string foo-bar
```

</GoForjExample>

### LastWord {#lastword}

LastWord returns the last word token or empty string.

<GoForjExample repo="str" example="lastword">

```go
// Example: last word
v := str.Of("Hello world").LastWord().String()
println(v)
// #string world
```

</GoForjExample>

### SplitWords {#splitwords}

SplitWords splits the string into words (Unicode letters/digits runs).

<GoForjExample repo="str" example="splitwords">

```go
// Example: split words
v := str.Of("one, two, three").SplitWords()
println(v)
// #[]string [one two three]
```

</GoForjExample>

### WordCount {#wordcount}

WordCount returns the number of word tokens (letters/digits runs).

<GoForjExample repo="str" example="wordcount">

```go
// Example: count words
v := str.Of("Hello, world!").WordCount()
println(v)
// #int 2
```

</GoForjExample>

### Words {#words-2}

Words limits the string to count words, appending suffix if truncated.

<GoForjExample repo="str" example="words">

```go
// Example: limit words
v := str.Of("Perfectly balanced, as all things should be.").Words(3, " >>>").String()
println(v)
// #string Perfectly balanced as >>>
```

</GoForjExample>

### WrapWords {#wrapwords}

WrapWords wraps the string to the given width on word boundaries, using breakStr between lines.

<GoForjExample repo="str" example="wrapwords">

```go
// Example: wrap words
v := str.Of("The quick brown fox jumped over the lazy dog.").WrapWords(20, "\n").String()
println(v)
// #string The quick brown fox\njumped over the lazy\ndog.
```

</GoForjExample>
<!-- api:embed:end -->
