# Design decisions — brain-scrambler-game

Handoff record. Last updated 2026-08-05.
**Status: Active Mode. Cabinet redesign shipped to `index.html`.**
The 2022 `script.js` and `style.css` are now orphaned; they are no longer
referenced by anything and go to the cleanup pass.

Everything below marked "awaiting review" or "proposed" is now **live**
unless it says otherwise. `_mockups/5` and `_mockups/6` have served their
purpose and are candidates for the cleanup pass — `5` is the closer call,
since it still holds the scope selector and the tight-spacing comparison.

**`index.html` is now the visual reference.** The screen mockups have
been through the cleanup pass and are gone — the live page supersedes
them, and every decision they carried is written down below.

One mockup survives:

| File | Covers | Why it stays |
|---|---|---|
| `_mockups/4-tier-wordmarks.html` | All four stylized tier wordmarks | It is the **source** of the animation code in `index.html`, not a picture of it. Change it and re-splice; never hand-edit the generated block |

Deleted in the cleanup pass, recoverable from commit `6e557d6` if ever
needed: `0-palette` (every hex is in the table below), `1-start`,
`2-playing`, `3-out-of-guesses` (all superseded by the live screens),
`5-desktop-layout` and `6-tile-font` (their comparisons were against
options that have since been decided).

---

## Approved direction

Full rewrite as a single self-contained `index.html`. Vanilla JS, no
jQuery, no external runtime dependencies. Theme is **arcade — fun,
entertaining, challenging**, with "fun" as the governing visual value.

## Palette (APPROVED)

| Role | Hex |
|---|---|
| Background | `#141327` |
| Surface | `#26215C` |
| Text | `#EEEDFE` |
| Text muted | `#AFA9EC` |
| Accent | `#D85A30` |
| Correct | `#97C459` |
| Present | `#EF9F27` |
| Absent | `#A32D2D` |

Two contrast constraints that must survive future edits:

- **`#A32D2D` is deliberately low-contrast against the background
  (~2.6:1).** This is intentional — absent letters should recede. Do not
  "fix" it. Legibility is carried by `#FCEBEB` text on the tile.
- **`#D85A30` is ~4.3:1 on the background.** Fine for fills, borders,
  and large type. It fails WCAG for small body text — use `#F0997B` if
  accent-colored small text is ever needed.

## Game mechanics

Ported from `The_Brain_Scrambler.py`, which holds the better design:

- Word drawn from the Python file's 90-word list
- Letters shuffled at runtime, with a re-shuffle guard so the scramble
  never equals the source word
- **3 guesses**, then reveal
- Per-letter feedback after each wrong guess: correct / present / absent
- Coins scale to guess number — 3 / 2 / 1 for solving on try 1 / 2 / 3,
  multiplied by the tier's coin value in `words.json`

## Word list

Lives in **`words.json`** — 253 words across four difficulty tiers. The
tier label is shown to the player as the word is served.

| Tier | Label shown | Count | Coins | Basis |
|---|---|---:|---:|---|
| 1 | Scrambled | 43 | 1 | 4–5 letters, everyday vocabulary |
| 2 | Twisted | 90 | 2 | 6–7 letters, common words |
| 3 | Mangled | 85 | 3 | 7–9 letters, less common |
| 4 | Obliterated | 35 | 5 | 9–12 letters, abstract or rare |

*Was 250. `milky`, `zesty` and `rifle` were in the Python original but
had been dropped from `words.json`, which broke the "all 90 retained"
claim below. Restored to tier 1 during the build, 2026-08-05.*

**A word is drawn uniformly from the flat 253-word pool**, not by
picking a tier and then a word. Same thing in effect — the diamond
distribution is what makes the middle tiers common — but it means the
served mix (17 / 36 / 34 / 14 %) tracks the counts above automatically,
with no separate weighting to keep in sync.

**Diamond distribution, deliberately.** Both ends are thin so the middle
carries play. Too many easy words gets boring fast; too many brutal ones
is discouraging. Do not flatten this to an even split.

**Tiers are served at random**, not as an escalating ladder — see
rejected decisions below for why.

The original 90 words from `The_Brain_Scrambler.py` are all retained and
distributed across the tiers.

**Tier wordmarks** are stylized and animated, appearing above the letter
rack when a word is served — see `_mockups/4-tier-wordmarks.html`. Pure
CSS keyframes on live text, no image assets, so they recolor with the
palette and stay sharp at any size. Distortion and color both escalate
with tier: muted → present → accent → absent.

Choreography, one per tier:

- **Scrambled** — letters trade places a few times, then settle
- **Twisted** — the twist travels down the word, letters turning edge-on
  at the turn. Built on `rotateX` with perspective; a 2D rotation reads
  as a wave, not a twist, and was rejected for that reason
- **Mangled** — letters fly in from both sides, collide, squash on impact
- **Obliterated** — the word holds intact for a beat, then blows apart,
  with a translucent fireball behind the letters and lingering smoke

Timing: **1000ms run, repeating at a 9s base randomised ±40%.** The
randomisation is deliberate — a fixed interval becomes a metronome and
reads as a loading spinner within about three cycles. Every animation
ends on the static wordmark, so play never waits on one finishing.

**Obliterated fire effect.** A translucent fireball sits on the bottom
layer behind the letters, hazy, gradient red at the base through orange
to yellow at the tip. It is **not persistent** — it flares as the word
blows apart and burns out with the animation. Three wispy smoke plumes
drift upward continuously at very low opacity.

Everything is CSS gradients plus blur; no images, no SVG filters. It
stays behind the letters by z-order and never competes with the puzzle.
Only 35 of 250 words are tier 4, so the effect stays rare.

**`prefers-reduced-motion` drops the animations entirely** and shows the
static wordmarks. No reduced substitute, no fade — nothing moves,
including the fire and smoke.

Tier boundaries blend by design — a few tier-3 words are only 7 letters
and earn their difficulty from being uncommon rather than long. Words
can be moved between tiers freely; nothing depends on length alone.

## Data and storage

**Nothing persists unless the player opts in.** A single **"Save my
progress"** toggle sits in the header next to the coin counter, **off by
default**. One switch covers both the player name and the coin balance —
deliberately one decision, not two, so the player is never asked for
storage permission twice.

Behavior:

- **Off (default):** nothing is written. Name lives in memory for the
  session only; coins reset on reload. Refusal is *not* recorded — there
  is no "already asked" flag, because a toggle doesn't nag, so there is
  nothing to suppress.
- **On:** name and coins are written under one versioned key.
- **Switched off after being on:** the stored key is **deleted
  entirely**, not just ignored. Turning it off must actually remove the
  data.

Storage shape — a versioned object under a single key, not a bare
number, so a future inventory can be added without breaking existing
saves:

```json
{
  "v": 1,
  "name": "crystal",
  "coins": 42,
  "updated": "2026-08-05T14:52:00Z"
}
```

Note for future reference: `localStorage` is device-local. Nothing is
transmitted and the site owner cannot read it. The opt-in is a courtesy
to the player, not a regulatory requirement — worth remembering if the
UI ever starts feeling heavy for what it protects.

## Roadmap (not in scope now)

Recorded so today's decisions stay compatible, not as committed work:

- Player accounts
- A store for spending coins on play-page decorations and other
  game-related digital assets

The versioned storage object above is the one concession made now. If
accounts arrive, the local object becomes the offline cache and `v`
handles migration. **Any real account system moves data off-device,
which is genuine data collection** — unlike the current localStorage
model — and would need its own privacy treatment.

## Interaction

- **Two-row drag rack.** Answer slots on top, letter pool below. Letters
  grey out in the pool as they're placed. Chosen over a single
  rearranging row, which tested as confusing mid-drag.
- **Persistent last-guess strip** below the controls. This replaces the
  Python version's vague "That was really close!" string with a visible
  per-letter readout that stays put across all three tries. It is the
  main playability upgrade in the rewrite and the reason the three
  feedback colors exist.
  **The label is "Last Guess" and nothing else** — it used to repeat the
  guessed word in text, which the scored tiles directly below already
  spell out. Saying it twice added a line of height and no information.

## Fun elements (all approved)

- Tiles snap into slots; wrong guess shakes the row; correct answer
  flips tiles over one at a time
- Chunky geometry — 8px radii, thick borders, generous tile size
- Sound generated in-code via Web Audio
- Reward beats: coins fly to counter, streak indicator, solve-in-one bonus
- Orbitron throughout, not only the h1

## Rejected, with reasons that still bind

- **jQuery** — dropped. Nothing in the game needs it; keeping the build
  dependency-free is a goal, not an accident.
- **kasandbox.org assets** (coin image, MP3s) — dropped. Externally
  hosted on a third party that may disappear. Do not reintroduce
  external asset hosts; use inline SVG and Web Audio.
- **`prompt()` for player name** — dropped in favor of a real start
  screen. The original also referenced a `#startForm` that never existed
  in the HTML.
- **Silent persistence of anything** — rejected. Superseded by the
  opt-in model; see "Data and storage" above. The 2022 version saved the
  player name to localStorage without asking. Nothing persists now
  unless the player turns it on.
- **Escalating difficulty by streak** — rejected. A ladder guarantees
  every player eventually reaches a wall they cannot clear, which ends
  the session. Random tiers mean a brutal word is followed by a
  winnable one. Do not revisit this without a plan for the wall.

## Bugs in the old code — do not reintroduce

From the 2022 `script.js`:

1. `#startForm` / `#startButton` / `#name` referenced in JS and CSS but
   absent from `index.html` — new players got a blank page
2. `Math.round(Math.random()*12)` over a 12-item list — index 12 is out
   of range, yielding `undefined`
3. Answer check used `answerKeys.includes(playerAnswer)` — accepted
   *any* word from the list, not the one displayed. Subtle and the most
   important to avoid repeating.
4. Enter-to-submit used `e.enterKey`, not a real event property, and
   targeted the wrong form
5. No guess limit — the core 3-guess mechanic was missing entirely

In `The_Brain_Scrambler.py` (unfixed, still present):

- Prints "You got it right!" even after the player runs out of guesses
- `clues` is a module-level list that is never cleared, so hint accuracy
  degrades every round

## Resolved at build time (2026-08-05)

**Tier label placement — the animated wordmark carries it, alone.** The
static header label from the mockup is gone. The wordmark above the rack
already *is* the tier name, so a second copy in the header was
redundant. Header now holds name / guess counter / coins only.

**Win screen.** Screen 3's structure with `--correct` framing, plus:

- **Gentle trumpet fanfare** — C–E–G–held C, synthesised in Web Audio as
  a sawtooth through a sweeping lowpass with a 90ms attack. Not a
  sample: external audio hosting is a rejected direction, and a sampled
  trumpet would have reintroduced it. "Gentle" is carried by the slow
  attack and the low peak gain (0.09–0.11) — a hard attack on the same
  notes reads as a blare.
- **Full-screen confetti** — canvas, 160 pieces, gravity plus rotation,
  fades out at ~4.2s and stops at ~5.8s
- **Balloons rising from the bottom** — 14 DOM elements, CSS-only,
  randomised size, drift and duration, cleared after 11s
- **Buttons: "Next word" and "Quit".** *Quit is deliberately unwired* —
  the handler is an empty stub with a TODO. Wiring it is a later
  session's work.

Headline varies: `SOLVED IN ONE!` on a first-guess solve, otherwise
`UNSCRAMBLED!`. Loss keeps `SCRAMBLED!` in `--absent`.

## Desktop layout — proposed, not yet live

Mocked in `_mockups/5-desktop-layout.html`. **Not in `index.html` yet.**

The complaint being answered: at 560px fixed, on a desktop monitor the
game reads as a small box stranded at the top of an empty field.

**Rejected: true full-bleed.** Stretching everything to the window edges
is the obvious fix and the wrong one here. This is a drag game — the
distance between the letter pool and the answer slots is ergonomics, not
decoration, and it goes from ~100px to ~800px on a 27" display. The
three header items also stop reading as one bar once they are that far
apart. Chunky arcade geometry depends on being compact.

**Chosen: cabinet framing + fluid sizing.** Two halves:

- *Cabinet* — the page fills the viewport, the card does not. A lit
  marquee carries the title, an accent bezel surrounds the play area,
  faint scanlines and an ambient glow light the corners of a large
  screen. The empty space becomes designed space instead of absence.
- *Fluid* — the card grows from 320px to an **820px cap** via `clamp()`.
  The cap is what keeps the drag short; without it this becomes
  full-bleed by degrees.

### The frame is fixed against word length (Crystal, 2026-08-05)

**One tile size for every word. The frame is sized once, for the longest
word in `words.json` (12 letters), and does not move between rounds.**

Tile width is derived, not chosen:

```
--tile-w: calc((var(--card) - 2*var(--pad) - 11*var(--gap)) / 12)
```

so 12 tiles fit the card exactly and a 4-letter word uses the same tile
as a 12-letter one, centred with air either side. At the 820px cap that
is a 54.5px tile — slightly larger than the 46px in the early mockups.

**This supersedes `.rack.long` / `.rack.xlong` in `index.html`**, which
shrink tiles for 8+ and 10+ letter words. That is exactly the behaviour
being rejected: it made the cabinet twitch every time a word was served,
and it lost height that the empty side margins could have absorbed
instead. Those two rules must come out when this goes live.

Phones are the one exception, and only as a second fixed regime: below
560px, 12 tiles across would be ~21px — too small to hit — so the rack
switches to 6 per row and wraps, with the row height **reserved for two
rows at all times**. Still fixed, just a different fixed. The frame
changes at that breakpoint, which is a deliberate resize, never a new
word.

The title moves into the marquee, which means the start screen's stacked
"THE BRAIN / SCRAMBLER" treatment is now duplicated. Resolve when this
goes live — likely the start screen loses its own title.

Scanlines are the piece most likely to be wrong; they are a legibility
cost for an aesthetic gain. The mockup has a toggle so the comparison is
direct rather than argued.

### Spacing scale (Crystal: "the card is a little crowded")

**Three steps, and nothing in the card uses anything else.** The
crowding was not only that the gaps were small — they were also
arbitrary, a pile of one-off inline margins (10 / 22 / 14 / 24 / 22 / 20
px) inherited from the mockups, so nothing lined up with anything.

| Token | Range | Used for |
|---|---|---|
| `--pad` | 20 → 38px | card padding |
| `--space-lg` | 18 → 34px | between major blocks |
| `--space-md` | 14 → 26px | between the two halves of the rack |
| `--space-sm` | 7 → 13px | label to the thing it labels |

Card padding rose from 14–28px to 20–38px. Because `--tile-w` is derived
from the card width *minus* padding, the tile shrinks slightly in
exchange — 54.5px → 52.8px at the cap. That trade is the right way
round: the air matters more than 1.7px of tile.

The mockup keeps an **"old tight spacing"** toggle for the before/after.

### Pool tiles are smaller than the slots

`--pool-scale: .78`. The pool is the *source* of a drag and the slots
are the *target*, so the target carries the larger hit area — the right
way round, since the slot is what you have to land on. Reclaims ~13px of
height at the cap, and the size difference doubles as a cue about which
row you act on.

**Floored at 42px on touch only** (`max-width: 560px`). On a 320px phone
the unfloored pool tile lands at 34px, which is not thumb-sized. Desktop
has no floor because a mouse does not need one.

### All UI text is Title Case

Applied to the mockup **and to the live `index.html`** in the same pass,
since the strings are shared and letting them drift apart would have
been a bug waiting to happen. Casing is independent of the layout
question, so this one change is live ahead of the rest.

Covered: "Drop Letters Here", "Your Letters", "Save My Progress", "No
Guesses Yet", "Last Guess · Pleat", "The Word Was", the Coins / Solved /
Streak stat labels, the "Your Name" placeholder, and the "Start Game" /
"Next Word" buttons. The end-screen line reads "+6 Coins ·
Solve-In-One Bonus · Twisted" — `tier.label` in `words.json` was already
Title Case, so the `.toLowerCase()` that had been applied to it came
out.

Two things deliberately **not** Title Cased:

- **Orbitron caps** — the player name, `GUESS 2 / 3`, the tier wordmarks,
  the marquee. These are display type, not labels, and the all-caps
  treatment is the arcade voice.
- **The start-screen blurb** — "Three guesses per word. Drag the letters
  into place." That is a sentence. Title Case belongs on labels.

**All inline styles in the card were converted to classes** matching the
ones already in `index.html` — `.hdr`, `.savebar`, `.strip` — plus new
`.tier`, `.rack-row`, `.controls`, `.strip-lbl`, `.meta`, `.savelbl`.
The port to the live page is now mostly a stylesheet swap rather than a
markup rewrite.

## Tile font — Orbitron fails the one job (Crystal, 2026-08-05)

**Orbitron's D and O are the same rounded rectangle**, differing by a
few pixels of straightened left edge at tile size. 0 vs O is as bad.
That is tolerable in a headline and disqualifying on a letter tile,
because reading one letter in isolation *is* the game. "Orbitron
throughout" under Fun elements is therefore amended: Orbitron stays for
display type, the tiles get a font chosen for glyph separation.

Candidates mocked in `_mockups/6-tile-font.html`, all confirmed live on
Google Fonts:

| Font | Character | Cost |
|---|---|---|
| **Chakra Petch** | Squared techno, nearest to Orbitron's voice | Least disruptive; still clearly a game face |
| **Press Start 2P** | Real 8-bit arcade; a pixel grid cannot blur two glyphs together | Widest per glyph, weakest in long words |
| **Share Tech Mono** | Terminal rather than cabinet | Lighter than the palette was drawn for |
| **JetBrains Mono** | Designed so programmers never confuse two characters — literally our problem | Reads as a code editor, not a game |

The mockup has a **squint test** (1.1px blur). Glyphs that stay apart
under blur stay apart at a glance, which is the condition that actually
matters in play — nobody studies a tile.

### Press Start 2P chosen (Crystal, 2026-08-05) — trialling scope

Now live in `_mockups/5-desktop-layout.html`, with a **scope selector**
in the controls: tiles only (default), everything, or nothing (the
Orbitron before-state). A squint test sits next to it.

Implementation notes that carry to the live page:

- **Its own size ratio.** Press Start 2P puts far more cap-height and
  width in an em than Orbitron, so tiles use `.40` of tile width against
  Orbitron's `.46` — 20px where Orbitron sat at 24px, and they read as
  the same size.
- **Size is snapped to 2px** via `round(down, …, 2px)`. A pixel face
  against a fluid tile lands on fractional sizes and the grid goes soft.
  2px is a compromise: the font is drawn on an 8px grid and would be
  crispest at 8px steps, but snapping that coarsely collapses to 8px on
  mid-size windows. Browsers without `round()` get the unsnapped value —
  slightly soft, not broken.
- `line-height: 1`, `letter-spacing: 0`, weight 400 — it has one weight,
  and the letter-spacing the other faces carry throws its grid off.

**"Everything" scope covers the display type only** — the Orbitron
headers, marquee, tier label and buttons. Labels stay Red Rose; a pixel
face at 12px on running text is unreadable. Watch the mixed-case buttons
("Check", "Shuffle") in that mode — Press Start 2P's lowercase is where
it looks least comfortable.

**Scope decided: everything** (Crystal, 2026-08-05). Press Start 2P now
carries the tiles, marquee, header, buttons, stats and end-screen lines.
Red Rose keeps the running text — labels, the blurb, the save toggle —
because a pixel face at 12px on prose is unreadable.

**One exception: the tier wordmarks keep Orbitron.** They are animated
per-letter, and the pixel grid fights the `rotateX`, squash and
scatter keyframes — a face built on whole pixels smears under
sub-pixel transforms. Orbitron is still loaded for that one rule and
nothing else.

## Quit — wired (2026-08-05)

Returns to the start screen. **The run is deliberately kept**: name,
coins, solved and streak all survive, so Start Game continues rather
than restarting. Wiping the score on Quit would be a second, invisible
data decision sitting on top of the save toggle, and the player never
asked for one.

Quit is still shown on a win only, not on a loss — which is arguably
backwards, since someone who just ran out of guesses is the more likely
quitter. Left as-is because it was not asked for; a one-line change if
wanted.

## Open questions

- Whether Quit should also appear on the out-of-guesses screen

*Resolved and shipped 2026-08-05: tile font (Press Start 2P, everything),
desktop layout (cabinet + fluid + fixed frame), start-screen title (the
marquee took it, the screen lost its stacked copy).*

## How `index.html` was built

Not hand-typed end to end. Three blocks were **spliced in verbatim** by
a one-shot script, from markers left in the file:

| Marker | Source |
|---|---|
| `/*@@WORDS@@*/` | all of `words.json` |
| `/*@@WM_CSS@@*/` | `_mockups/4-tier-wordmarks.html` lines 23–29 and 34–61 |
| `/*@@WM_ENGINE@@*/` | same file, lines 105–155 (`DUR`, `BASE`, `reduce`, `TIERS`, `JIT`, `frames`) |

This is why the wordmark keyframes are byte-identical to the approved
mockup. **If they ever need changing, change the mockup and re-splice —
do not edit the generated block in `index.html` by hand.** The splice
script was not kept: the markers are gone now, so a re-splice means
re-marking the file, and keeping a stale script around would have made
it ambiguous which file is the source of truth. `index.html` is.

The only adaptation was the driver around the engine: the mockup shows
all four wordmarks at once and loops each independently, whereas the
game shows one at a time, so `show(key)` swaps the visible stage and
re-points a single timer. `play`, `frames`, `TIERS` and `JIT` are
untouched.

### Deviations from the mockups, and why

- **`prefers-reduced-motion`** now also drops confetti, balloons and the
  coin-fly, not just the wordmark animations. Same principle, extended
  to the elements that did not exist when the rule was written.
- **Long words shrink the rack.** 46px tiles × 12 letters overflows a
  phone. `.rack.long` (8+ letters) and `.rack.xlong` (10+) step the
  tiles down to 34px and 27px. The mockup only ever showed a 5-letter
  word, so this case was not covered.
- **Click and keyboard work as well as drag.** Drag alone is unusable on
  touch. Clicking a pool tile fills the first empty slot, clicking a
  filled slot returns the letter, typing places by letter, Backspace
  removes the last, Enter checks.

### Verification run at build time

`words.json` integrity (counts match the tier table, no duplicates, all
90 Python words present), the re-shuffle guard across all 253 words,
per-letter scoring including duplicate-letter cases, coin maths, and
both full game paths — solve and three-strikes — driven through a DOM.
Storage was checked to write nothing while the toggle is off and to
delete the key when switched off. All passed.

Two things that check found: the three missing words noted above, and
nothing else. The two apparent scoring failures were errors in the test's
own expected values, not in the game.

## Project conventions

- **Mockups live in `_mockups/`**, one HTML file per screen, numbered.
  They persist through design and are reviewed in the cleanup pass after
  the first live push.
- **Rejected directions are deleted, not archived.** `_mockups/` holds
  only the current approved direction. Superseded mockups get removed
  immediately — keeping them creates confusion later about which file is
  live, and a rejected design has no future relevance.
- **Token costs are always quoted with their type** — "~600 output
  tokens", never a bare "~600 tokens".

### Cleanup pass

Runs after the first live push. The prompt is exactly:

> Review all files in the project folder. Delete any that are no longer
> used **and** will have no future use.

Both conditions must hold. "Doesn't ship" is not the test — a file can
be non-shipping and still have future use. `design-decisions.md` and
`token-tracker.md` are the obvious examples: neither ever ships, both
stay. `_mockups/` typically goes because once the live page exists it
supersedes the mockups, but that is a judgment call per file, not
automatic.

## Related files

- `_mockups/` — visual reference, one file per screen
- `index.html` — **the live game**, self-contained
- `words.json` — 253 words, four tiers; ships inlined into `index.html`,
  so edit here and re-splice rather than editing the copy in the page
- `design-decisions.md` — this file
- `token-tracker.md` — running token estimates
- `The_Brain_Scrambler.py` — the 2022 original; kept as the source of the
  word list and mechanics, and because it is the thing being rewritten
- `_mockups/4-tier-wordmarks.html` — source of the wordmark animation code
- `README.md` — repo readme, shown on GitHub

`script.js` and `style.css` were deleted in the cleanup pass: the 2022
page no longer exists to reference them.
