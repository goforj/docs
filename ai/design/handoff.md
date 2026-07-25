# Design Handoff — Brand and Theme Overhaul

## Purpose

This file hands off the visual design exercise conducted ahead of release. It records what was
diagnosed, what was explored, what was decided, and what remains open.

Nothing in this work has been applied to the live site. Everything lives in `ai/design/` as
self-contained HTML prototypes. The implementation step is still ahead.

Read this with `ai/site-theme-system.md`, which describes the existing theme's structure and the
constraints any implementation has to respect.

---

## The diagnosis

The site's accent colour is stock VitePress, untouched. Computed tokens pulled off the running
site:

| Token | Value | Origin |
| --- | --- | --- |
| `--vp-c-brand-1` | `#a8b1ff` | VitePress default |
| `--vp-c-brand-3` | `#3e63dd` | VitePress default |
| `--vp-c-bg` | `#1b1b1f` | VitePress default |
| `--vp-c-text-1` | `#dfdfd6` | VitePress default |

Every button, link, active sidebar item, and TOC marker on the site is therefore Vue's indigo,
while the hero illustration is ember orange. **The site has two identities, and the dominant one
is a framework default nobody chose.** That mismatch is the root of the "doesn't feel like
GoForj" problem.

Secondary findings:

- **Light mode was never really built.** The landing hero and docs chrome carry dark-mode
  assumptions, so light mode renders half-broken. This is a decision to make, not a bug to fix —
  shipping dark-only is legitimate, but the toggle currently exists and half-works.
- **Sixteen code themes is a symptom.** A picker that broad usually means the default was never
  settled. Once a direction is chosen this should collapse to two or three that belong to it.

---

## Artifacts

| File | What it is |
| --- | --- |
| `ai/design/forge-riffs.html` | **The main artifact.** Eight directions, four syntax palettes, two inline-code treatments, two code surfaces, light/dark, plus a full component showcase. Open in a browser. |
| `ai/design/brand-directions.html` | The first-round exploration (Forge Iron / Blueprint / Molten). Superseded but kept for the reasoning. |

`forge-riffs.html` has five independent switchers in the header — direction, mode, syntax,
inline code, code surface. They compose, so any direction can be viewed with any combination.

**Every switcher is in the URL**, so a specific combination is a shareable address and this file
works as a long-term reference base:

```
ai/design/forge-riffs.html#dir=temper&mode=dark&syn=warm&code=warm&well=lifted
```

There is a **Copy link** button top right. The file opens on the decided combination: Temper,
dark, Lifted code surface, Warm syntax. Inline code opens on the incumbent (Warm frame) because
that decision is still open — see below.

Under the palette there is a **plane-separation readout** showing both WCAG ratio and ΔL\* for
every surface against the page ground. It exists because those two metrics disagree, and the
disagreement matters — see *Verification method*.

Both files are standalone HTML with no build step. They load fonts from Google Fonts, so they
need network access. They are **not** served by VitePress and must not be moved into
`docs/public/` — that would ship them to production.

---

## Directions explored

Eight directions, all in the warm-metal family, organised by an explicit principle: **steel
announces its temperature by colour, so each direction picks a point on the forging scale and
commits.** The heat strip at the top of the prototype shows where each sits.

| Direction | Thesis | Verdict |
| --- | --- | --- |
| **Temper** | Molten + elevation + an action/navigation colour split, warm throughout | **Leading candidate** |
| **Forge** | Molten with a real elevation ladder so cards and screenshots have a plane to sit on | Strong second |
| Molten | Near-black, one flat accent, huge tight type, minimal chrome | The anchor everything else improves on |
| Edge | Molten pushed harder — hotter accent, zero radius, film-grain texture | Highest impact, elevation problem unsolved |
| Steel | Action/navigation split using a cool steel blue | Good idea, wrong colour — reads too close to the indigo being replaced |
| Iron | Warm near-black, ember accent, Archivo | Lowest cost to ship; existing assets already match |
| Anvil | Cold graphite ground, ember used sparingly | Kindest ground for screenshots; least distinctive |
| Carbon | Pure black, monospace wordmark | Most ownable idea in the exercise; may undersell the product |

Four earlier directions (Crucible, Patina, Ash, Quench) were cut.

---

## Temper — the specification

Tempering is the last heat treatment steel gets: it takes metal that is hard but brittle and
makes it tough enough to use. The direction does the same to Molten — keeps the look, fixes the
two structural problems.

### Colour rules

The system's value is in the rules, not the hexes. Colour means exactly one of four things:

| Role | Colour | Form | Where |
| --- | --- | --- | --- |
| **Action** | Molten orange | Always **filled** | Primary button, install prompt, version badge, h1 accent rule |
| **Navigation** | Temper gold | Always **text or line** | Body links, active sidebar, TOC marker, active nav, callout rule |
| **Reference** | Warm frame, **white ink** | Filled, but ink is white | Inline code chips |
| **Neither** | Neutral surface | Surface + hairline | Table headers, code block chrome, disclosure controls |

**The form rule is load-bearing.** Action and navigation are only 28.5° apart in hue, so they do
not separate on colour alone the way orange and blue would. Filled-vs-text carries the rest of
the distinction. This convention has to be written down and enforced in review — it will not hold
by itself.

### Tokens — dark

```
--ground        #0C0A0E      --ink            #FFFFFF
--ground-alt    #131017      --ink-2          #A9A1B3
--surface       #1A1620      --ink-3          #746C80
--surface-2     #221D2A      --on-accent      #08070A
--line          #2A2333      --accent         #FF5E3A   (action)
--line-strong   #3D3349      --accent-hi      #FF8257
--code-bg       #14101A      --nav            #FFC24D   (navigation)
                             --nav-hi         #FFD37A

--accent-soft   rgba(255,94,58,.12)     --nav-soft   rgba(255,194,77,.11)
--accent-line   rgba(255,94,58,.32)     --nav-line   rgba(255,194,77,.30)
```

### Tokens — light

```
--ground        #FFFFFF      --ink            #0C0A0E
--ground-alt    #F7F5F9      --ink-2          #5F5868
--surface       #FFFFFF      --ink-3          #867E90
--surface-2     #F2EFF5      --on-accent      #FFFFFF
--line          #E6E2EC      --accent         #D6351A
--line-strong   #CEC7D8      --accent-hi      #B32B13
--code-bg       #F7F5F9      --nav            #8F5D00
                             --nav-hi         #6E4700
```

Note that in light mode the gold must darken to bronze to clear contrast, which shifts the feel.
Worth reviewing before committing to a light mode at all.

### Status colours

Status is a **third system**, separate from action and navigation. A warning has to look like a
warning; brand purity does not outrank comprehension.

| Role | Dark | Light |
| --- | --- | --- |
| Tip | `#5FCFA8` | `#0F6E52` |
| Warning | `#FFB454` | `#8A5A00` |
| Danger | `#FF6B85` | `#B3213C` |

Danger is deliberately a **true red**, pushed away from the action orange. Those two sitting near
each other was a real collision risk.

### Typography

Display `Space Grotesk` 700 at `-0.045em`, body `Inter`, mono `JetBrains Mono`, radius `8px`.

---

## Go syntax highlighting

### What the site runs today

VitePress default, no theme configured in `config.mts` — which resolves to **github-dark**.
Token colours were sampled off the rendered DOM rather than assumed:

```
plain #E1E4E8   keyword #F97583   func/type #B392F0   param #FFAB70
string #9ECBFF  constant #79B8FF  green #85E89D       comment #6A737D
```

Its contrast works for structural reasons worth preserving: **every token is a high-luminance
pastel, hues sit far apart, plain text is near-white, and comments are the only dim element.**

Two fidelity details confirmed by inspecting live output, easy to get wrong:

- Go built-in types (`error`, `string`) are painted with the **keyword** colour, not a type colour
- `nil` is a **constant**, not a keyword

### The three transpositions

Each preserves github-dark's luminance profile and shifts hue into the Temper family. Every token
lands within roughly one contrast point of the original; where they differ they are brighter,
because Temper's code surface is darker than GitHub's.

| Token | Warm | Ember | Neon |
| --- | --- | --- | --- |
| plain | `#E6E0EC` | `#E4DDE8` | `#F0EAF5` |
| comment | `#8A8196` | `#8A8196` | `#8A8196` |
| keyword | `#F97583` | `#FF8A6B` | `#FF6B85` |
| built-in | `#F97583` | `#FFAB8F` | `#FF9E7C` |
| type | `#D9A0F0` | `#9BD7C4` | `#C89BFF` |
| function | `#D9A0F0` | `#FFC24D` | `#C89BFF` |
| string | `#E8C98A` | `#D9CE7A` | `#B8E86B` |
| number / constant | `#FFB9A0` | `#FFAB8F` | `#7FD8FF` |
| tag key / verb | `#A8D98A` | `#B8D96B` | `#5FE8B0` |
| punctuation | `#9089A0` | `#9089A0` | `#9089A0` |

- **Warm** — minimal deviation. Keeps github-dark's salmon keywords and only moves the three cool
  tokens. Recommended: someone who likes the current highlighting will not feel they lost anything.
- **Ember** — warm-dominant with a single cool anchor for types. Prettier in isolation, harder to
  parse in dense code.
- **Neon** — github's separation with higher saturation. Most pop.

Light-mode equivalents for all three are defined in the prototype and clear AA.

### Scope mapping

For building the Shiki theme:

| Role | Shiki scopes |
| --- | --- |
| Keyword | `keyword.control`, `keyword.other` |
| Built-in type | `storage.type.built-in`, `support.type` |
| Type | `entity.name.type` |
| Function | `entity.name.function`, `support.function` |
| String | `string.quoted.double`, `string.quoted.raw` |
| Format verb | `constant.other.placeholder` |
| Number | `constant.numeric` |
| Constant | `constant.language` |
| Struct tag key | `meta.struct-tag entity.name.tag` |
| Comment | `comment.line`, `comment.block` |
| Plain | `variable.other`, `source.go` |
| Punctuation | `punctuation.*`, `meta.brace` |

---

## Inline code — decided

Five treatments were compared side by side on a deliberately code-dense sentence (seven
references in two sentences). The winner is **warm frame, bright ink**: accent-tinted background
and border, but the text stays white.

The reasoning: inline code is the first thing developers scan for, so it has to be loud. But if
it borrows the action colour it reads as clickable, and a dense paragraph lights up like an
alert. Warm frame gets its salience from **material rather than from a semantic colour**, so code
can shout without lying about what it is.

An earlier iteration made code chips neutral. That was an over-correction — it protected the
colour rules at the cost of scannability, which is the wrong trade in developer docs.

---

## Component coverage

The prototype covers, all responding to the selected direction:

- **Code** — line numbers with highlighted ranges, diff blocks, code group tabs, copy states,
  terminal (success and failure)
- **Content** — four callout levels plus one with actions, disclosure, steps, parameter lists,
  file tree, keyboard keys, tables, anchor headings, blockquote
- **Navigation** — nav bar, breadcrumbs, sidebar with active/hover/visited, TOC, search modal,
  version menu, prev/next pager
- **Interface** — button variants and states, badges and method pills, cards, stat tiles, forms
  with an error state, checkboxes, toggles, progress, toast, empty state, tooltip, skeletons

---

## Verification method

Contrast was checked programmatically before building, not eyeballed after. Every palette —
8 directions × 2 modes, plus 4 syntax palettes × 2 modes — was run through a WCAG contrast
calculation for body, muted, tertiary, accent, link, and button-text pairings.

All ship-ready combinations clear **AA**. Tertiary ink (`--ink-3`) sits in AA-large, which is
acceptable for decorative and non-essential text but should not be used for content.

Two adjustments came out of this rather than from taste: Molten's light accent moved from
`#E03A1C` to `#D6351A` to clear AA, and syntax comments were lifted from github-dark's `#6A737D`
(3.9:1) to `#8A8196` (5.1:1), since comments are content people actually read.

---

## Open decisions

1. **Direction.** Temper is leading, Forge is the fallback if the two-colour split proves too
   subtle in practice.
2. **Light mode — build it, or drop the toggle?** Currently half-built. Either is defensible;
   the current in-between state is not.
3. **Syntax palette.** Warm recommended. Needs a side-by-side look against the current theme on
   a real page before committing.
4. **Code theme picker.** Cut from 16 to two or three that belong to the chosen direction.
5. **Hero illustration.** The existing isometric render works in Iron's palette but not in
   Molten-family grounds. Temper would need it re-rendered or replaced.
6. **Logo.** The prototype marks are placeholders to test the palette, not finished identity work.

---

## Implementation notes

When this moves into the real theme, respect the constraints already documented in
`ai/site-theme-system.md`:

- **`custom.css` is ~5,065 lines** and too large for whole-file reads. Edit via exact-string
  replacement and verify the anchor exists first.
- **The critical scoping rule.** The home layout also renders markdown inside `.vp-doc`, so any
  bare `.vp-doc` rule leaks onto the landing page. Default to `.VPDoc.has-sidebar` for anything
  decorating prose headings.
- **Motion gating.** Every animation must use the established `prefers-reduced-motion` +
  `[data-gf-motion]` pattern.
- **Verify in the browser.** Screenshots of a background tab can capture stale paints; confirm
  with computed-style probes before declaring a bug.

Suggested order:

1. Replace the VitePress brand tokens with the Temper token layer — this alone removes the indigo
2. Build the Shiki theme from the scope mapping above; cut the code variant picker
3. Apply the inline-code treatment and the link/sidebar/TOC navigation colour
4. Work outward through callouts, tables, buttons, cards
5. Resolve the light-mode decision
6. Re-render or replace the hero illustration
7. Regenerate favicon and OG image to match

---

## A caution

Contrast ratios and token tables are the easy part and are already settled. **The part that will
decay is the action/navigation/reference discipline.** It is a convention, not a constraint —
nothing in CSS stops someone from making a link orange. If Temper ships, that four-row rule table
belongs in the contributing guide and in review checklists, or the system will quietly erode back
into one accent doing every job.
