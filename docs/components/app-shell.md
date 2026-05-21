# app-shell — Application layout shell

**Selector:** `tab-app-shell`
**File:** `projects/components/src/lib/app-shell/app-shell.component.ts`
**Mock reference:** `docs/mocks/assets/css/base.css:23-99`
**Used in:** every screen (host for `<tab-header>`, page content, `<tab-nav>`)

## Purpose

Owns the responsive `.app` shell. On mobile/tablet it's a single flex column with
a sticky bottom nav. On desktop (≥ 960 px) it switches to a CSS grid with a
sticky 240 px left rail and a max-width content column. Login / Add pages
(`noNav` mode) center a narrow framed card.

## Visual reference

```
Mobile (< 960):           Desktop (≥ 960) with nav:        Desktop no-nav (login/add):
┌──────────────┐          ┌─────┬─────────────────┐        ┌────────────┐
│  header      │          │     │  header         │        │  hero card │
│              │          │ nav │                 │        │  centered  │
│  content     │          │ rail│  content        │        │  480px max │
│              │          │     │                 │        │  radial bg │
│ ── nav bar ──│          │     │                 │        └────────────┘
└──────────────┘          └─────┴─────────────────┘
```

## API

### Inputs
| Name | Type | Default | Description |
|---|---|---|---|
| `noNav` | `boolean` | `false` | Hide nav, switch to centered-card layout on desktop |

### Content projection
- Default slot: page content (header, main, nav in DOM order)

## Visual specs

- `min-height: 100dvh` on body.
- `main` padding: `var(--s-5) var(--content-pad) calc(var(--s-9) + var(--s-7))`.
- `main.no-nav` overrides bottom padding: `var(--s-8)`.
- Tablet (≥ 640): `main` padding-top becomes `var(--s-7)`; non-nav app width caps at `560px`, centered.
- Desktop (≥ 960):
  - App with nav: `max-width: var(--content-max) (1200px)`, `display: grid`,
    `grid-template-columns: var(--rail-w) 1fr` (240px rail).
  - Rail (`tab-nav`) is `grid-column: 1; grid-row: 1 / -1; position: sticky; top: 0; height: 100dvh`.
  - Content (`*:not(tab-nav)`) goes in `grid-column: 2; min-width: 0`.
  - `main` padding: `var(--s-8) var(--content-pad) var(--s-9)`, `max-width: 920px`.
  - No-nav app: `max-width: 480px; margin: var(--s-9) auto; border-radius: var(--r-xl);
    border: 1px solid var(--c-hairline-strong); box-shadow: 0 30px 80px rgba(0,0,0,0.45); overflow: hidden`.
  - Body for no-nav: `background: radial-gradient(circle at 50% 0%, #38383b 0%, #1d1d1f 70%)`.
- Custom scrollbar: `main::-webkit-scrollbar { width: 8px }`, thumb `--c-elevated`, radius pill.

## Angular template

```ts
@Component({
  selector: 'tab-app-shell',
  standalone: true,
  template: `
    <div class="app" [class.no-nav]="noNav">
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./app-shell.component.scss'],
  encapsulation: ViewEncapsulation.None, // global layout
})
export class TabAppShellComponent {
  @Input() noNav = false;
  @HostBinding('class.tab-app-host') hostClass = true;
}
```

## SCSS

```scss
@use 'components/tokens' as tokens;

.app {
  width: 100%;
  min-height: 100dvh;
  background: var(--c-bg);
  display: flex;
  flex-direction: column;
  position: relative;
}

:host ::ng-deep main {
  flex: 1 1 auto;
  width: 100%;
  padding: var(--s-5) var(--content-pad) calc(var(--s-9) + var(--s-7));
  overflow-y: auto;
}
:host ::ng-deep main.no-nav { padding-bottom: var(--s-8); }

@media (min-width: 640px) {
  :host ::ng-deep main { padding-top: var(--s-7); }
  .app.no-nav { max-width: 560px; margin-inline: auto; }
}

@media (min-width: 960px) {
  .app:has(tab-nav) {
    max-width: var(--content-max);
    margin-inline: auto;
    display: grid;
    grid-template-columns: var(--rail-w) 1fr;
    align-items: stretch;
  }
  .app:has(tab-nav) > tab-nav {
    grid-column: 1;
    grid-row: 1 / -1;
    position: sticky;
    top: 0;
    align-self: start;
    height: 100dvh;
  }
  .app:has(tab-nav) > *:not(tab-nav) { grid-column: 2; min-width: 0; }
  .app:has(tab-nav) main {
    padding: var(--s-8) var(--content-pad) var(--s-9);
    max-width: 920px;
  }
  .app.no-nav {
    max-width: 480px;
    margin: var(--s-9) auto;
    min-height: auto;
    border-radius: var(--r-xl);
    border: 1px solid var(--c-hairline-strong);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
    overflow: hidden;
  }
}
```

In `projects/tab/src/styles.scss`, scope the radial background to `body:has`:

```scss
body:has(.app.no-nav) {
  background: radial-gradient(circle at 50% 0%, #38383b 0%, #1d1d1f 70%);
}
```

## Acceptance criteria

- [ ] Mobile renders single column with sticky bottom nav.
- [ ] At ≥ 960 px with `<tab-nav>` present, the rail occupies 240 px column 1 sticky to viewport.
- [ ] `noNav` collapses padding and centers a 480 px framed card on desktop.
- [ ] Scrollbar matches `8px` width with `--c-elevated` thumb.
- [ ] Layout snaps cleanly at 640, 960, 1280 breakpoints with no horizontal scroll.
