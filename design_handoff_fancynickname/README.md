# Handoff: fancynickna.me

## Overview
**fancynickna.me** is a free, no-signup web app for generating fancy nicknames — Unicode styled text users can paste into Discord, Instagram, TikTok, game profiles, etc. The product spans three pages:

1. **Main page (`/`)** — type once, get ~25 styled Unicode versions in a grid, tap any card to copy
2. **Workshop (`/workshop`)** — hand-build a nickname by clicking individual letters, symbols, decoration wraps, and transforms in a tabbed palette beside a live preview
3. **3D renderer (`/render`)** — render the nickname as 3D extruded text (Three.js), tweak materials/lighting/background, export as PNG at any size

Target stack (per the user): **SvelteKit + shadcn-svelte**. Tailwind assumed.

## About the design files
The files in this bundle are **design references created in HTML/React** — prototypes showing the intended look and behavior. They are **not** production code to copy directly.

Your job is to **recreate this design in SvelteKit** using shadcn-svelte components and Tailwind for layout/typography. The React JSX is provided so you can read the component composition; rewrite it as Svelte components.

Two files are framework-agnostic and **should be ported as-is, not redesigned**:
- `fancy-text.js` → `src/lib/fancyText.ts` (add types). Pure Unicode mapping library.
- `builder-data.js` → `src/lib/builderData.ts`. Static data for symbol categories + decoration templates.

The Three.js engine in `render-engine.js` is also reusable; it has a small imperative API documented in §5 below.

## Fidelity
**High-fidelity.** Exact colors, type, spacing, and interactions are specified below. Use shadcn-svelte primitives where they fit but override Tailwind classes to match the spec — don't substitute generic shadcn defaults that diverge.

---

## Brand & visual system (shared across all three pages)

### Aesthetic
Modern brutalist meets Y2K. Chunky display type, cream + ink palette with one electric accent, blurless offset shadows, tactile click feedback. Original — no copyrighted UI elements.

### Colors
```css
/* Base */
--bg:        #F5F2EA;   /* cream — default light bg */
--fg:        #0E0E10;   /* ink — primary text + borders */
--card:      #FFFFFF;   /* card surface in light mode */
--fg-soft:   rgba(14,14,16,0.62);
--fg-faint:  rgba(14,14,16,0.40);
--line:      rgba(14,14,16,0.14);
--line-strong: rgba(14,14,16,0.28);

/* Accent (single one at a time) */
--accent:    #C8FF3D;   /* acid lime (default) */
/* alternates exposed via tweaks panel on the main page: */
/*   #FF4FB0 hot pink, #4F7CFF electric blue, #FF7A3D sunset */

/* Dark mode (only on main page tweak) */
--bg-ink:    #0E0E10;
--fg-ink:    #F5F2EA;
--card-dark: #1A1A1D;
```

### Type
```
Display:  'Archivo Black', system-ui, sans-serif      (Google Fonts)
Body:     'Space Grotesk' 400/500/600/700              (Google Fonts)
Mono:     'JetBrains Mono' 400/600                     (Google Fonts)
Serif:    system serif (Times / Cambria) — used for rendering Unicode
          math characters; never override to a sans on fancy-text values
```

Load via `<link>` in `app.html` or `@fontsource/*`.

### Type scale (fluid)
| Use | Size |
|---|---|
| H1 hero (main) | `clamp(36px, 5.2vw, 72px)` / lh 0.95 / track -0.025em |
| H2 section | `clamp(32px, 5vw, 56px)` / track -0.02em |
| H2 small | `clamp(28px, 4vw, 44px)` |
| Section title (panels) | 18px Archivo Black, lowercase |
| Big input (hero) | `clamp(28px, 4.5vw, 48px)` Archivo Black |
| Card value (style/transform previews) | `clamp(20px, 2.2vw, 30px)` **serif** |
| Body | 14.5–18px Space Grotesk |
| Mono label | 10–13px uppercase, letter-spacing 0.06–0.10em |
| Footer wordmark | `clamp(70px, 16vw, 240px)` outlined Archivo Black |

### Spacing & radii
- Section horizontal padding: `clamp(20px, 4vw, 56px)`
- Vertical section padding: 40–80px
- Radii: pills/chips/buttons `999px`; input card `18px`; result cards `14px`; small fields `10px`
- All shadows are **hard offsets, no blur** — brutalist signature. Do not soften.
  - Input card idle: `6–8px 6–8px 0 var(--fg)`
  - Input focused: `12px 12px 0 var(--accent), 12px 12px 0 2.5px var(--fg)` (layered accent + ink outline)
  - Card hover: `4px 4px 0 var(--accent), 4px 4px 0 1.5px var(--fg)`
  - Toast: `0 8px 24px rgba(0,0,0,0.18)` (this one IS blurred — only exception)

### Shared chrome (all pages)
1. **Marquee bar** — full-width, accent background, 2px ink bottom border, Archivo Black 14px uppercase, scrolls horizontally over 40s linear infinite. Items separated by 10px dots.
2. **Topbar** — flex row, 18–22px vertical padding, 1px line bottom border. Logo on left (`✶` glyph in accent w/ 1.5px ink stroke, then "fancynickna.me" — the `.` is also accent-stroked). Nav on right: `styles`, `workshop`, `3D`, plus a pill CTA. Active link gets a 2px ink underline + full opacity. Hide non-CTA, non-active links below 640px.
3. **Toast** — fixed bottom-center pill, ink bg, cream text, mono 13px, slides up + fades on entry (200ms ease-out), auto-dismisses after 1600ms.

---

## 1. Main page (`/`)

**Route:** `/` → `src/routes/+page.svelte`

### Sections (top to bottom)

#### Marquee
Sample items: `fancy fancy fancy`, `✦ since whenever ✦`, `made for the chronically online`, `⌬ no signup ⌬`, `free forever`, `★彡 paste anywhere 彡★`, `discord. twitch. bsky. wherever.`, `𝓯𝓻𝓮𝓮 𝓯𝓸𝓻𝓮𝓿𝓮𝓻`. Duplicate the array 3× inside an inline-flex track, animate `translateX(0)` → `translateX(-33.333%)`.

#### Hero
- Padding: `clamp(40px, 7vw, 100px) clamp(20px, 4vw, 56px) 40px`. Left-aligned, max-width 1200px.
- **Eyebrow pill** — `1px solid var(--line)`, rounded-full, mono 12px lowercase ink-soft. Leading 8px lime dot with halo shadow, pulses 1 → 1.3 → 1 over 1.5s. Text: `the nickname generator that does too much`.
- **Title `<h1>`** — `clamp(36px, 5.2vw, 72px)` Archivo Black, lh 0.95, track -0.025em, `text-wrap: balance`. Content:
  - Line 1: `make your name`
  - Line 2: A cycling `<span>` (5ch min-width container, position: relative; absolutely-positioned variants) that swaps every 1.5s between three serif treatments of "fancy" with skewX(-3deg) on enter/exit, 4.5s keyframe cycle:
    - `𝕗𝕒𝕟𝕔𝕪` (double-struck)
    - `𝓯𝓪𝓷𝓬𝔂` (bold script)
    - `꧁ＦＡＮＣＹ꧂` in accent color
  - Line 3: `as hell.`
- **Subhead** — `clamp(14px, 1.2vw, 16px)` ink-soft, max-width 520px. Copy: `type your name once. get {N}+ styled versions. tap to copy. paste in your discord, your bio, your group chat, wherever.`
- **Input cue** — mono 12px uppercase 0.1em ink (NOT soft — full ink, 600 weight) with a bouncing 20px `↓` arrow before it. Copy: `type your name here`. The arrow loops translateY 0 → 5px → 0 over 1.2s.
- **Input card** — max-width 720px, 2.5px ink border, radius 18px, padding `22px 24px 26px`, `8px 8px 0` ink shadow. **Idle pulse animation** swaps the shadow to a layered accent + ink shadow every 2.8s — this is the "obvious" cue. On focus the animation stops and shadow becomes `12px 12px 0 var(--accent), 12px 12px 0 2.5px var(--fg)` with a `translate(-2px, -2px)`.
  - Label inside: mono 11px uppercase 0.08em ink-soft, content `your name`.
  - Input: Archivo Black `clamp(28px, 4.5vw, 48px)`, transparent bg, no border, track -0.02em, maxlength 32, placeholder `type something...` at 40% opacity.
  - Clear button: absolute bottom-right (`18px` from edges), 1px line border, rounded-full, mono 12px ink-soft. Hover → ink bg + cream text.
- **Counter row** — flex, gap `clamp(20px, 4vw, 56px)`, margin-top 36px. 4 counters: `{N} styles`, `{deco packs count} deco packs`, `32 char limit`, `∞ free uses`. Number is Archivo Black `clamp(28px, 4vw, 44px)`. Label below is mono 11px uppercase ink-soft.

#### Suggestion chips row
- Leading mono 12px uppercase ink-soft `try:`
- Chips: 1px line border, rounded-full, padding `8px 14px`, 13px regular. Hover → ink bg + cream text + translateY(-1px).
- Suggestions: `Maya`, `kai`, `Ren`, `404`, `voidbabe`, `goblin`, `tofu`, `cherry`, `glitch`, `mochi`

#### Results grid
- Top border 2px ink. Header row: `<h2>` "all the styles." Archivo Black, with mono meta on the right "tap any card · copies instantly".
- **Grid layout** (default): `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`, gap 14px
- **Mosaic layout** (tweak): 12-col grid, cards span 4 by default; 7n+1 spans 6, 7n+4 spans 8, 7n+6 spans 6. Below 900px collapses to 2-col equal spans.
- **List layout** (tweak): single column, cards become flex-row with 200px head on left.
- **Card** (the core repeating component, 25× from `FancyText.styles`):
  - `<button>`, white card, 1.5px ink border, radius 14px, padding `16px 18px`, min-height 110px
  - Hover: translate(-2px, -2px) + accent-shadow as above
  - Active: translate(0,0), no shadow
  - **Copied state** (`.copied`): bg swaps to accent, status text becomes ink 700
  - Head row (mono 11px uppercase 0.06em): `#01`–`#25` index (full ink, 600), style name (flex 1, ink-soft), status text "tap to copy" → "copied!"
  - Value: **serif**, `clamp(20px, 2.2vw, 30px)`, lh 1.15, `word-break: break-word; overflow-wrap: anywhere`

#### FAQ strip
- Top border 2px ink. Background `color-mix(in oklab, var(--fg) 4%, var(--bg))`.
- `<h2>` "questions you're definitely asking" Archivo Black `clamp(28px, 4vw, 44px)`.
- Grid: `repeat(auto-fit, minmax(280px, 1fr))`, gap 24px.
- Items:
  1. **is it free?** — yes. forever. no signup. no ads. no tracking.
  2. **will it work on discord/insta/tiktok?** — most styles, yes. some platforms strip combining characters — try a different style if one breaks.
  3. **is it actually a font?** — nope — unicode characters that look like fonts. that's why they work in places where you can't change the font.
  4. **can i use the glitch one in my username?** — sometimes. try it. worst case it gets rejected and you pick another.

#### Footer
- Big wordmark "fancynickna.me" — Archivo Black `clamp(70px, 16vw, 240px)`, `-webkit-text-stroke: 2px var(--fg); color: transparent`, user-select none.
- Meta row mono 12px uppercase ink-soft: `© whatever year you're reading this` · `made with too much time` · `v0.1` (in accent).

### Behavior
- **Click-to-copy:** card `onClick` → `navigator.clipboard.writeText(variant.value)` → flash `.copied` 900ms, toast `copied "{style name}"` 1600ms.
- **Glitch regeneration:** zalgo styles re-roll their combining marks every 1400ms via a `tick` counter.
- **Variants list:** memoized derivation `map FancyText.styles → { id, name, value: applyDeco ? deco.pre + fn(name) + deco.post : fn(name) }`. Empty input falls back to `"YourName"`.

### Tweaks panel (top-right toggle)
This is a dev-time exploration panel — for production, **decide on defaults and remove**. The current options exposed:
- Accent: `lime` / `pink` / `blue` / `orange`
- Background: `cream` / `ink` (dark mode)
- Decoration pack + "apply to output" toggle
- Layout: `grid` / `mosaic` / `list`
- Show counter row

---

## 2. Workshop (`/workshop`)

**Route:** `/workshop` → `src/routes/workshop/+page.svelte`

A hand-builder for users who want full control. Two-column layout: sticky preview on the left, tabbed palette on the right.

### Layout
```
grid-template-columns: minmax(360px, 440px) 1fr;
```
At ≤920px, collapses to a single column (preview on top, palette below).

### Left pane — preview & actions (sticky `top: 90px`)
- **Eyebrow** "preview · live" with the same pulsing dot pattern.
- **Preview box** — white card, 2px ink border, radius 18px, padding `28px 22px`, `6px 6px 0` ink shadow, min-height 180px.
  - Filled state: serif `clamp(28px, 3.4vw, 44px)`, word-break + overflow-wrap.
  - Empty state: mono 14px ink-faint placeholder `your nickname appears here →`
  - **Flash animation** on insert: 300ms scale + accent-shadow swap, triggered by a `key={flashChar}` remount.
  - Meta footer (mono 11px uppercase ink-soft): `{[...name].length} chars · {byteLength} bytes`
- **Direct-edit input** — labeled `edit directly`, mono 15px, 1.5px ink border, focus → `3px 3px 0 accent` shadow.
- **Big copy button** — full-width, ink bg, cream text, Archivo Black 18px lowercase, radius 14px, padding `16px 22px`. Hover → accent bg + ink text + `4px 4px 0 ink` shadow + translate(-2px,-2px).
- **Action row** — 3-col grid: `⌫ clear`, `↶ undo` (disabled when no history), `⟳ random`. Each is a vertical button with a 18px glyph + mono 11px label. Hover → ink bg.
- **Recent row** (only shown when non-empty) — serif 16px chips of recently inserted characters, 1px line border. Clicking re-inserts.

### Right pane — tabbed palette
- **Tab strip** — sticky `top: 90px`, 2px ink bottom border, flex row, overflow-x scroll. Each tab is Archivo Black 15px with a serif glyph prefix. Active tab gets accent background + full ink. Hover: subtle 4%-ink wash.
- **4 tabs:**

#### Letters tab
Pick a fancy alphabet then click any A–Z, a–z, 0–9 to insert in that style.
- **Alphabet picker:** wrapping row of pill cards. Each pill stacks (mono 10px uppercase name) + (serif 22px sample "Aa" rendered in that style). Active pill: ink bg, cream text, accent-shadow.
- Filters out styles that don't make sense one-letter-at-a-time (flip, strike, underline, wavy, spaced, zalgo).
- Three sections labeled (mono 11px uppercase): `uppercase`, `lowercase`, `digits`. Each is a `CharGrid`.

#### Symbols tab
Categorized Unicode characters.
- Subcategory pill row (rounded-full pills, active → ink bg)
- Big `CharGrid` (cols=10) of the active category's chars
- Categories defined in `builder-data.js`: Stars, Hearts, Sparkles, Music, Arrows, Brackets, Geometric, Crowns, Mystic, Greek, Cyrillic, Lines, Weather, Cards

#### Decorations tab
22 wrap templates that bracket the name with matching glyphs on both sides.
- Grid `repeat(auto-fill, minmax(240px, 1fr))`, gap 12px
- Each card shows: mono name (e.g. `mystic`), serif live preview `{pre}{name||"YourName"}{post}`, mono `apply →` in bottom-right
- Templates in `builder-data.js` — examples: `꧁༒ … ༒꧂`, `★彡 … 彡★`, `⋆˚࿐ … ࿐˚⋆`, `『 … 』`, `╰☆☆ … ☆☆╮`

#### Transform tab
Apply a style to the whole current nickname (replaces what's there).
- Grid `repeat(auto-fill, minmax(240px, 1fr))`, gap 12px
- Each card: mono name + serif live preview of `style.fn(name || "YourName")`
- All 25 styles from `FancyText.styles` are available here (including the heavy zalgo variants — they make sense applied to a whole word).

### Shared: `CharGrid` component
```
grid-template-columns: repeat(var(--cols), 1fr); gap: 6px;
```
Each tile:
- aspect-ratio 1, white card, 1px line-strong border, radius 10px
- Serif `clamp(18px, 1.8vw, 24px)` (or 22-32 in `.big` variant)
- Hover: accent bg, ink border, scale 1.06, `2px 2px 0 ink` shadow, z-index 2
- Active: scale 0.95
- onClick → insert chunk at cursor position (or end if input not focused)

### Behavior
- **Insert helper** — reads `input.selectionStart/End` if the edit input is focused, splices the chunk in, advances the caret to after the insert. Falls back to appending if focus is elsewhere. Tracks insertion in the `recent` list (deduped, last 18).
- **Undo** — push pre-action state onto a `history` stack (capped ~30). `↶` pops and restores.
- **Random** — pick: random template + random style + random base word from `['void','cherry','glitch','lunar','echo','static','pixel','mochi','cosmo','witch','shy','feral']` + two random symbols → assemble as `{tmpl.pre}{symA} {style.fn(base)} {symB}{tmpl.post}`.

---

## 3. 3D Renderer (`/render`)

**Route:** `/render` → `src/routes/render/+page.svelte`

Three.js scene that extrudes the user's name into 3D and lets them tune materials, lighting, background, and export as PNG.

### Layout
```
grid-template-columns: 1fr 380px;   /* canvas left, controls right */
height: calc(100vh - 100px);        /* below marquee + topbar */
body { overflow: hidden; }          /* page doesn't scroll — panel does */
```
At ≤920px the panel becomes a right-edge drawer toggled by a top-right `settings ⚙` button.

### Canvas area
- **Checkerboard backdrop** (24px tiles in 4% ink) so transparent renders are visually obvious. The canvas itself is on top.
- **Camera HUD** — bottom strip with two ink-bordered mono buttons (`⟲ reset`, `⛶ fit`) and a right-aligned hint `drag · scroll · pinch`.
- **Loading overlay** — semi-transparent wash with mono `loading renderer…` text, shown while the engine and first font load.

### Controls panel (right)
Vertical scroll. Sections divided by dashed line-strong borders. Each section starts with an 18px Archivo Black lowercase title.

| Section | Controls |
|---|---|
| **your name** | text input (mono 16px, maxlength 24), font select (8 Three.js typeface fonts) |
| **geometry** | size slider 0.4–3, depth slider 0–1.5, bevel toggle, bevel size 0–0.15, bevel thickness 0–0.2 |
| **material** | 9-preset grid: Matte / Plastic / Metal / Chrome / Gold / Glass / Neon / Toon / Wire. Plus color swatch row with 12 swatches + custom picker |
| **lighting** | 5-preset row: Studio / Sunset / Neon / Drama / Soft |
| **scene** | Background segmented radio (solid / gradient / none), color swatches for the relevant color(s), auto-rotate toggle, rotation speed slider -3 to 3 |
| **export** | Transparent-bg toggle, 2-col preset grid (8 cards), custom W×H inputs + export button |
| **footer actions** | `copy settings JSON`, `reset all` |

#### Reusable form controls
- **`<Slider>`** — value+label header (mono 11px uppercase), styled `<input type=range>` with accent thumb on ink track
- **`<Toggle>`** — flex row label + iOS-style switch (gray track → accent track + 16px translate-x)
- **`<SegRadio>`** — segmented control inside a 1.5px ink border, active segment gets ink bg
- **`<PresetGrid>`** — N-col grid of mono uppercase buttons. Active: ink bg + cream text + `2px 2px 0 accent` shadow
- **`<ColorRow>`** — 28×28 rounded-square swatches. Active: ink border + accent halo (`0 0 0 2px accent, 0 0 0 4px ink`). Trailing `+` slot opens native `<input type="color">`.

### Export presets
| ID | Label | Size | Hint |
|---|---|---|---|
| `sq1080` | Square | 1080×1080 | 1:1 · Instagram |
| `story`  | Story  | 1080×1920 | 9:16 · Story / Reel |
| `land`   | Landscape | 1920×1080 | 16:9 · YouTube |
| `port`   | Portrait | 1080×1350 | 4:5 · IG portrait |
| `sq4k`   | Square 4K | 2160×2160 | Print-ready |
| `banner` | Banner | 1500×500 | 3:1 · Header |
| `avatar` | Avatar | 512×512 | Profile pic |
| `hd`     | HD | 1280×720 | 16:9 |

Custom size: numeric inputs 64–8192 each axis.

Filename pattern: `${safeName}_${w}x${h}${transparent ? '_transparent' : ''}.png`

### Renderer engine (`render-engine.js`)
Pure Three.js, framework-agnostic. Use it directly in the Svelte app.

**Construction**
```js
const r = new NameRenderer(canvasElement);
// auto-starts animation loop, attaches OrbitControls + ResizeObserver
```

**API**
| Method | Purpose |
|---|---|
| `update(settings)` | Async — rebuilds geometry (loads font on demand, caches), swaps material, updates lighting + background |
| `resetCamera()` | Returns to default position `(0, 0.6, 10)` |
| `fitToText()` | Frames the current text mesh |
| `exportPNG({ width, height, transparent })` | Returns a PNG data URL at exact size (temporarily resizes, renders, restores) |
| `dispose()` | Tears down listeners + WebGL context |

**Settings shape**
```ts
type Settings = {
  text: string;
  font: 'helvetiker' | 'helvetiker_bold' | 'gentilis' | 'gentilis_bold'
      | 'optimer'    | 'optimer_bold'    | 'droid_sans' | 'droid_serif';
  size: number;        // 0.4–3
  depth: number;       // 0–1.5
  bevel: { enabled: boolean; size: number; thickness: number };
  material: {
    preset: 'matte' | 'plastic' | 'metal' | 'chrome' | 'gold'
          | 'glass' | 'neon' | 'toon' | 'wireframe';
    color: string;     // hex
  };
  lighting: 'studio' | 'sunset' | 'neon' | 'drama' | 'soft';
  background:
    | { type: 'solid';       color: string }
    | { type: 'gradient';    color: string; color2: string }
    | { type: 'transparent' };
  autoRotate: boolean;
  rotateSpeed: number; // -3 to 3
};
```

**Three.js setup details that matter**
- `WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })` — `preserveDrawingBuffer` is REQUIRED for `toDataURL()` PNG export, otherwise you get a blank image.
- `ACESFilmicToneMapping`, `outputColorSpace = SRGBColorSpace`, exposure 1.0
- `PMREMGenerator.fromScene(new RoomEnvironment(), 0.04)` for `scene.environment` — gives metal/glass something to reflect
- `OrbitControls` with damping 0.08, panning disabled, distance clamp 2–30
- Fonts loaded with `FontLoader` from `three/addons/loaders/FontLoader.js`, URLs pointing at `unpkg.com/three@0.160.0/examples/fonts/...` typeface.json files. Cached in a module-level map.
- The export flow saves all renderer state (size, clear color, alpha, pixelRatio, scene.background), applies the export size at `pixelRatio = 1`, renders once, grabs `domElement.toDataURL('image/png')`, then restores everything.

**Three.js dependency**
The prototype loads Three 0.160.0 from unpkg via an importmap. In SvelteKit, install:
```
npm i three@^0.160.0
```
The `addons/` paths (`TextGeometry`, `FontLoader`, `OrbitControls`, `RoomEnvironment`, `PMREMGenerator`) are all in `three/examples/jsm/...` — Vite handles them natively. Type defs: `npm i -D @types/three`.

### Lighting preset recipes
| Preset | Lights |
|---|---|
| **studio** | Ambient 0.5 + 3 directional lights: key (1,1,1) @ 2.0, fill from -X @ 0.7, rim from -Z @ 0.9 |
| **sunset** | Ambient warm 0.45 + warm dir 2.2 (front-right) + cool blue rim 1.4 (back-left) |
| **neon** | Ambient deep-blue 0.4 + magenta point light 8 + cyan point light 8 + small white back-fill 0.3 |
| **drama** | Ambient 0.12 + bright white key 3.5 from top-right + cool rim 0.55 |
| **soft** | Ambient 1.2 + single soft key 0.7 |

### Material recipes (Three.js)
| Preset | Material |
|---|---|
| matte | `MeshStandardMaterial` r=0.85 m=0 |
| plastic | `MeshPhysicalMaterial` r=0.45 m=0.05 clearcoat=0.7 |
| metal | `MeshStandardMaterial` r=0.22 m=1 |
| chrome | `MeshStandardMaterial` color=white r=0.02 m=1 |
| gold | `MeshStandardMaterial` color=0xd4af37 r=0.25 m=1 |
| glass | `MeshPhysicalMaterial` r=0.05 transmission=1 ior=1.45 thickness=0.5 |
| neon | `MeshStandardMaterial` near-black base + emissive=color emissiveIntensity=1.6 |
| toon | `MeshToonMaterial` |
| wireframe | `MeshBasicMaterial` wireframe=true |

### Gradient backgrounds
Generated as a 64×256 CanvasTexture from a vertical linear-gradient between `color` (top) and `color2` (bottom). Assigned to `scene.background`. SRGB color space.

---

## State management (suggested)

Per-page Svelte stores.

### Main page
| State | Type | Notes |
|---|---|---|
| `name` | string | Default `"Maya"`. |
| `copiedId` | string\|null | Drives `.copied` class, cleared 900ms |
| `toast` | string\|null | Cleared 1600ms |
| `tick` | number | Re-rolls zalgo every 1400ms |
| `tweaks.*` | various | See above |

### Workshop
| State | Type | Notes |
|---|---|---|
| `name` | string | The current nickname |
| `history` | string[] | Undo stack, cap 30 |
| `tab` | `'letters'\|'symbols'\|'decorations'\|'transform'` | |
| `alphabet` | string | Currently selected style id for Letters tab |
| `subcat` | string | Currently selected Symbols category |
| `recent` | string[] | Last 18 inserted chunks |
| `flashChar` | string\|null | Triggers preview flash via `key=` remount |

### 3D
| State | Type | Notes |
|---|---|---|
| `settings` | `Settings` | See type above |
| `customExport` | `{ w, h }` | |
| `transparent` | boolean | |
| `ready` | boolean | True once `renderer-ready` event fires |

---

## Suggested file structure (SvelteKit)

```
src/
├── lib/
│   ├── fancyText.ts                  ← port fancy-text.js as-is
│   ├── builderData.ts                ← port builder-data.js as-is
│   ├── render/
│   │   └── nameRenderer.ts           ← port render-engine.js
│   ├── components/
│   │   ├── chrome/
│   │   │   ├── Marquee.svelte
│   │   │   ├── TopBar.svelte
│   │   │   └── Toast.svelte
│   │   ├── main/
│   │   │   ├── Hero.svelte
│   │   │   ├── SuggestionChips.svelte
│   │   │   ├── ResultsGrid.svelte
│   │   │   ├── NickCard.svelte
│   │   │   ├── FAQ.svelte
│   │   │   └── SiteFooter.svelte
│   │   ├── workshop/
│   │   │   ├── PreviewPane.svelte
│   │   │   ├── PalettePane.svelte
│   │   │   ├── LettersTab.svelte
│   │   │   ├── SymbolsTab.svelte
│   │   │   ├── DecorationsTab.svelte
│   │   │   ├── TransformTab.svelte
│   │   │   └── CharGrid.svelte
│   │   └── render/
│   │       ├── Canvas3D.svelte
│   │       ├── ControlsPanel.svelte
│   │       ├── Section.svelte
│   │       ├── Slider.svelte
│   │       ├── Toggle.svelte
│   │       ├── SegRadio.svelte
│   │       ├── PresetGrid.svelte
│   │       ├── ColorRow.svelte
│   │       └── ExportGrid.svelte
│   └── stores/
│       ├── mainStore.ts
│       ├── workshopStore.ts
│       └── renderStore.ts
├── routes/
│   ├── +layout.svelte                ← fonts, CSS vars, base
│   ├── +page.svelte                  ← Main
│   ├── workshop/+page.svelte
│   └── render/+page.svelte
└── app.css                           ← Tailwind base + CSS vars
```

### shadcn-svelte mapping
| Design element | shadcn primitive |
|---|---|
| Result/template/transform card | `Card` (override padding/border/shadow heavily) |
| Suggestion chip, subcat pill | `Button variant="outline" size="sm"` rounded-full |
| Big copy button (workshop) | `Button variant="default"` styled large |
| Toast | `Sonner` |
| Input (hero, edit, controls text) | `Input` — override to remove default border for hero; keep default for controls |
| Nav CTA | `Button variant="default"` rounded-full |
| Tabs (workshop palette) | `Tabs` — restyle the trigger row |
| Select (font picker) | `Select` |
| Slider (geometry, scene) | `Slider` |
| Switch (toggle) | `Switch` — restyle to match the spec's iOS shape |
| Tweaks dev panel | `Sheet` — remove for production |

---

## Assets
- **Fonts:** Google Fonts: Archivo Black, Space Grotesk, JetBrains Mono — all free/open
- **Three.js typeface fonts:** loaded at runtime from unpkg (`three@0.160.0/examples/fonts/*.typeface.json`). For production, copy them into `/static/fonts/` and serve from same origin.
- **No images, no icons.** Everything is type, Unicode glyphs, or CSS shapes. The `✶` logo mark is a Unicode character (`U+2736`), not an SVG.

---

## Files in this bundle

| File | Purpose |
|---|---|
| `index.html` | Main page — open in browser to see live |
| `app.jsx` | Main page React component tree |
| `builder.html` | Workshop page |
| `builder.jsx` | Workshop React |
| `builder-data.js` | **Port directly** — symbol categories + decoration templates |
| `render.html` | 3D renderer page |
| `render.jsx` | 3D renderer React UI |
| `render-engine.js` | **Port directly** — Three.js engine class |
| `fancy-text.js` | **Port directly** — Unicode fancy-text mapping library |
| `tweaks-panel.jsx` | Dev tool — **do not port**, remove for production |

---

## Notes for implementation

1. **The brutalist shadow style is the visual signature.** Hard offsets, no blur, anywhere. The only exception is the toast (which uses a soft drop shadow for separation from page content).
2. **`font-family: serif` on fancy-text values is intentional** — Unicode math characters render best in a serif fallback (Times / Cambria Math). Do not override to a sans on `card-value`, `transform-preview`, `template-preview`, or `preview-name`.
3. **Glitch/zalgo strings can get tall.** Both `word-break: break-word` AND `overflow-wrap: anywhere` are needed on any container that shows fancy text.
4. **`preserveDrawingBuffer: true` is required** for the PNG export to work. Without it, `canvas.toDataURL()` returns a blank image — Three.js clears the buffer after each render by default.
5. **The cycling "fancy" word in the H1** depends on `position: relative` + `min-width: 5ch` on the container. The variants are absolutely positioned; without that min-width the line collapses.
6. **Idle pulse on the input card** is the main "obvious" affordance that tells users where to start. Keep the 2.8s timing and the layered shadow — that's the cue.
7. **The Workshop preview flash** uses `key={flashChar + Math.random()}` to force a remount, which restarts the CSS animation. Svelte equivalent: use `{#key}` block.
8. **Three.js `TextGeometry.center()`** must be called after construction — otherwise the text is bottom-left-anchored at the origin and rotates oddly.
9. **Empty text crashes TextGeometry.** Always pass at least a single space when the user clears the input.
10. **OrbitControls + Svelte:** call `controls.update()` in a `requestAnimationFrame` loop, and `controls.dispose()` in `onDestroy`. ResizeObserver on the canvas element handles aspect updates.
