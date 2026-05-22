/**
 * tab — Web Component library
 * Every reusable UI piece lives here. Pages compose these and add no styles
 * of their own beyond utility classes from base.css.
 */

const css = (s) => { const sheet = new CSSStyleSheet(); sheet.replaceSync(s); return sheet; };

const tokens = `
  :host {
    --c-bg:#2E2E30; --c-surface:#313133; --c-elevated:#3A3A3D;
    --c-muted:#77777C; --c-text:#B4B4BC; --c-text-strong:#E6E6EA;
    --c-text-faint:#5C5C61;
    --c-hairline:rgba(180,180,188,0.08);
    --c-hairline-strong:rgba(180,180,188,0.16);
    --c-focus:rgba(180,180,188,0.55);
    --font-sans: ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI","Inter",sans-serif;
    --font-num: ui-rounded,-apple-system,"SF Pro Display","Inter",sans-serif;
    --ease: cubic-bezier(0.2,0.7,0.2,1);
  }
`;

/* ---------- <tab-button> ---------- */
class TabButton extends HTMLElement {
  static get observedAttributes() { return ['variant', 'size', 'disabled', 'full']; }
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [css(tokens + `
      :host { display: inline-block; }
      :host([full]) { display: block; }
      button {
        font: inherit;
        font-family: var(--font-sans);
        font-weight: 550;
        letter-spacing: -0.005em;
        color: var(--c-bg);
        background: var(--c-text-strong);
        border: 1px solid transparent;
        padding: 14px 22px;
        border-radius: 12px;
        cursor: pointer;
        width: 100%;
        min-height: 48px;
        font-size: 15px;
        transition: transform var(--ease) 160ms, background var(--ease) 160ms,
                    color var(--ease) 160ms, border-color var(--ease) 160ms;
      }
      button:hover { background: #F2F2F4; }
      button:active { transform: scale(0.985); }
      button:focus-visible {
        outline: 2px solid var(--c-focus);
        outline-offset: 2px;
      }
      :host([variant="ghost"]) button {
        background: transparent;
        color: var(--c-text-strong);
        border-color: var(--c-hairline-strong);
      }
      :host([variant="ghost"]) button:hover {
        background: var(--c-elevated);
      }
      :host([variant="quiet"]) button {
        background: transparent;
        color: var(--c-text);
        border-color: transparent;
        padding: 10px 14px;
        min-height: 0;
      }
      :host([variant="quiet"]) button:hover {
        color: var(--c-text-strong);
        background: var(--c-elevated);
      }
      :host([size="sm"]) button {
        padding: 8px 14px;
        min-height: 0;
        font-size: 13px;
        border-radius: 8px;
      }
      :host([disabled]) button {
        opacity: 0.4; cursor: not-allowed;
      }
    `)];
    root.innerHTML = `<button part="button"><slot></slot></button>`;
  }
}

/* ---------- <tab-card> ---------- */
class TabCard extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [css(tokens + `
      :host { display: block; }
      .card {
        background: var(--c-surface);
        border: 1px solid var(--c-hairline);
        border-radius: 16px;
        padding: 20px;
      }
      :host([padding="sm"]) .card { padding: 14px; }
      :host([padding="lg"]) .card { padding: 28px; }
      :host([flat]) .card { background: transparent; border-color: var(--c-hairline-strong); }
      :host([hero]) .card {
        background: linear-gradient(180deg, #3A3A3D 0%, #313133 100%);
        border-color: var(--c-hairline-strong);
      }
    `)];
    root.innerHTML = `<div class="card" part="card"><slot></slot></div>`;
  }
}

/* ---------- <tab-input> ---------- */
class TabInput extends HTMLElement {
  static get observedAttributes() { return ['label', 'type', 'placeholder', 'value', 'prefix', 'hint']; }
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [css(tokens + `
      :host { display: block; }
      label {
        display: block;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--c-muted);
        font-weight: 600;
        margin-bottom: 8px;
      }
      .field {
        display: flex;
        align-items: center;
        background: var(--c-elevated);
        border: 1px solid transparent;
        border-radius: 12px;
        padding: 14px 16px;
        transition: border-color var(--ease) 160ms, background var(--ease) 160ms;
      }
      .field:focus-within {
        border-color: var(--c-focus);
        background: var(--c-surface);
      }
      .prefix {
        color: var(--c-muted);
        font-family: var(--font-num);
        font-weight: 500;
        margin-right: 8px;
      }
      input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--c-text-strong);
        font-family: var(--font-sans);
        font-size: 16px;
        min-width: 0;
      }
      input::placeholder { color: var(--c-text-faint); }
      :host([type="number"]) input,
      :host([money]) input {
        font-family: var(--font-num);
        font-variant-numeric: tabular-nums;
        font-weight: 500;
      }
      .hint {
        margin-top: 8px;
        font-size: 12px;
        color: var(--c-muted);
      }
    `)];
    root.innerHTML = `
      <label part="label"></label>
      <div class="field">
        <span class="prefix" hidden></span>
        <input />
      </div>
      <div class="hint" hidden></div>
    `;
  }
  attributeChangedCallback() {
    const r = this.shadowRoot;
    r.querySelector('label').textContent = this.getAttribute('label') || '';
    const input = r.querySelector('input');
    input.type = this.getAttribute('type') || 'text';
    input.placeholder = this.getAttribute('placeholder') || '';
    if (this.hasAttribute('value')) input.value = this.getAttribute('value');
    const prefix = r.querySelector('.prefix');
    const p = this.getAttribute('prefix');
    if (p) { prefix.textContent = p; prefix.hidden = false; } else { prefix.hidden = true; }
    const hint = r.querySelector('.hint');
    const h = this.getAttribute('hint');
    if (h) { hint.textContent = h; hint.hidden = false; } else { hint.hidden = true; }
  }
}

/* ---------- <tab-amount> ---------- */
class TabAmount extends HTMLElement {
  static get observedAttributes() { return ['value', 'size', 'currency', 'sign']; }
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [css(tokens + `
      :host {
        display: inline-flex;
        align-items: baseline;
        font-family: var(--font-num);
        font-variant-numeric: tabular-nums;
        color: var(--c-text-strong);
        font-weight: 500;
        letter-spacing: -0.02em;
        line-height: 1;
      }
      .currency {
        font-size: 0.55em;
        color: var(--c-muted);
        margin-right: 0.12em;
        font-weight: 600;
        transform: translateY(-0.45em);
      }
      .whole { font-weight: 500; }
      .cents {
        font-size: 0.5em;
        color: var(--c-muted);
        margin-left: 0.08em;
        transform: translateY(-0.45em);
        font-weight: 500;
      }
      .sign {
        color: var(--c-muted);
        margin-right: 0.08em;
      }
      :host([size="hero"])  { font-size: clamp(48px, 7vw + 16px, 88px); }
      :host([size="2xl"])   { font-size: clamp(32px, 3vw + 18px, 52px); }
      :host([size="xl"])    { font-size: clamp(24px, 1.4vw + 18px, 32px); }
      :host([size="md"])    { font-size: clamp(16px, 0.4vw + 15px, 20px); }
      :host([size="sm"])    { font-size: clamp(13px, 0.2vw + 12px, 15px); }
      :host([muted])        { color: var(--c-muted); }
      :host([muted]) .cents,
      :host([muted]) .currency { color: var(--c-text-faint); }
    `)];
    root.innerHTML = `<span class="sign" hidden></span><span class="currency"></span><span class="whole"></span><span class="cents"></span>`;
  }
  attributeChangedCallback() {
    const r = this.shadowRoot;
    const raw = parseFloat(this.getAttribute('value') || '0');
    const cur = this.getAttribute('currency') || '$';
    const abs = Math.abs(raw);
    const whole = Math.floor(abs).toLocaleString('en-US');
    const cents = (abs - Math.floor(abs)).toFixed(2).slice(2);
    r.querySelector('.currency').textContent = cur;
    r.querySelector('.whole').textContent = whole;
    r.querySelector('.cents').textContent = '.' + cents;
    const sign = r.querySelector('.sign');
    const s = this.getAttribute('sign');
    if (s) { sign.textContent = s; sign.hidden = false; } else { sign.hidden = true; }
  }
}

/* ---------- <tab-avatar> ---------- */
class TabAvatar extends HTMLElement {
  static get observedAttributes() { return ['name', 'size']; }
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [css(tokens + `
      :host { display: inline-flex; }
      .a {
        width: 36px; height: 36px;
        border-radius: 50%;
        background: var(--c-elevated);
        border: 1px solid var(--c-hairline-strong);
        display: grid; place-items: center;
        color: var(--c-text-strong);
        font-weight: 600;
        font-size: 13px;
        letter-spacing: 0.02em;
      }
      :host([size="lg"]) .a { width: 56px; height: 56px; font-size: 18px; }
      :host([size="sm"]) .a { width: 28px; height: 28px; font-size: 11px; }
    `)];
    root.innerHTML = `<div class="a"></div>`;
  }
  attributeChangedCallback() {
    const initials = (this.getAttribute('name') || '?')
      .split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
    this.shadowRoot.querySelector('.a').textContent = initials;
  }
}

/* ---------- <tab-badge> ---------- */
class TabBadge extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [css(tokens + `
      :host {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 999px;
        background: var(--c-elevated);
        border: 1px solid var(--c-hairline-strong);
        color: var(--c-text);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        font-family: var(--font-sans);
      }
      :host([strong]) { color: var(--c-text-strong); background: var(--c-surface); }
      :host([quiet])  { background: transparent; color: var(--c-muted); border-color: var(--c-hairline); }
      .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: 0.7; }
    `)];
    const dot = this.hasAttribute('dot') ? '<span class="dot"></span>' : '';
    root.innerHTML = `${dot}<slot></slot>`;
  }
}

/* ---------- <tab-row> ---------- */
class TabRow extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [css(tokens + `
      :host { display: block; }
      .row {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 14px;
        padding: 14px 4px;
        border-bottom: 1px solid var(--c-hairline);
        transition: background var(--ease) 120ms;
      }
      :host([interactive]) .row { cursor: pointer; padding: 14px; margin: 0 -10px; border-radius: 10px; border-bottom: 1px solid var(--c-hairline); }
      :host([interactive]) .row:hover { background: var(--c-elevated); }
      :host([last]) .row { border-bottom: none; }
      ::slotted([slot="leading"]) { display: inline-flex; align-items: center; }
      .body { min-width: 0; }
      ::slotted([slot="title"]) {
        display: block;
        color: var(--c-text-strong);
        font-weight: 500;
        font-size: 15px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      ::slotted([slot="meta"]) {
        display: block;
        color: var(--c-muted);
        font-size: 13px;
        margin-top: 2px;
      }
      ::slotted([slot="trailing"]) { justify-self: end; }
    `)];
    root.innerHTML = `
      <div class="row">
        <slot name="leading"></slot>
        <div class="body">
          <slot name="title"></slot>
          <slot name="meta"></slot>
        </div>
        <slot name="trailing"></slot>
      </div>
    `;
  }
}

/* ---------- <tab-divider> ---------- */
class TabDivider extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [css(tokens + `
      :host { display: block; height: 1px; background: var(--c-hairline); margin: 16px 0; }
      :host([strong]) { background: var(--c-hairline-strong); }
    `)];
  }
}

/* ---------- <tab-header> ---------- */
class TabHeader extends HTMLElement {
  static get observedAttributes() { return ['title', 'back', 'href']; }
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [css(tokens + `
      :host { display: block; }
      header {
        display: grid;
        grid-template-columns: 40px 1fr 40px;
        align-items: center;
        gap: 12px;
        padding: 16px clamp(16px, 4vw, 56px) 8px;
        background: var(--c-bg);
        position: sticky; top: 0; z-index: 5;
      }
      .title {
        text-align: center;
        font-size: clamp(14px, 0.3vw + 13px, 16px);
        font-weight: 600;
        color: var(--c-text-strong);
        letter-spacing: -0.005em;
      }
      a.back {
        width: 40px; height: 40px;
        display: grid; place-items: center;
        color: var(--c-text);
        border-radius: 999px;
        text-decoration: none;
      }
      a.back:hover { background: var(--c-elevated); color: var(--c-text-strong); }
      .arrow { width: 18px; height: 18px; display: block; }
      .spacer { width: 40px; }
      ::slotted([slot="action"]) { justify-self: end; }

      /* Desktop — left-aligned page title, back button collapses (rail handles nav) */
      @media (min-width: 960px) {
        header {
          grid-template-columns: 1fr auto;
          padding: 32px clamp(24px, 4vw, 56px) 16px;
          background: transparent;
          position: static;
        }
        a.back { display: none; }
        .title {
          text-align: left;
          font-size: clamp(22px, 1vw + 18px, 28px);
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        .spacer { display: none; }
        ::slotted([slot="action"]) { justify-self: end; }
      }
    `)];
    root.innerHTML = `
      <header>
        <a class="back" hidden>
          <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
        </a>
        <div class="title"></div>
        <slot name="action"><div class="spacer"></div></slot>
      </header>
    `;
  }
  attributeChangedCallback() {
    const r = this.shadowRoot;
    r.querySelector('.title').textContent = this.getAttribute('title') || '';
    const back = r.querySelector('a.back');
    if (this.hasAttribute('back')) {
      back.hidden = false;
      back.href = this.getAttribute('href') || '#';
    } else {
      back.hidden = true;
    }
  }
}

/* ---------- <tab-nav> ----------
   Mobile/tablet: sticky bottom bar with 4 columns + labels under icons.
   Desktop (≥960px): vertical left rail with brand, icon-left labels.
*/
class TabNav extends HTMLElement {
  static get observedAttributes() { return ['active']; }
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [css(tokens + `
      :host {
        position: sticky;
        bottom: 0;
        display: block;
        background: rgba(46, 46, 48, 0.86);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-top: 1px solid var(--c-hairline-strong);
        z-index: 10;
      }
      .brand-rail { display: none; }
      nav {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        padding: 8px 8px max(8px, env(safe-area-inset-bottom));
        gap: 2px;
      }
      a {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 10px 6px;
        color: var(--c-muted);
        text-decoration: none;
        font-size: 11px;
        font-weight: 500;
        border-radius: 12px;
        transition: color var(--ease) 160ms, background var(--ease) 160ms;
        min-width: 0;
      }
      a:hover { color: var(--c-text); }
      a.active { color: var(--c-text-strong); }
      a.active svg { stroke: var(--c-text-strong); }
      a span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      svg {
        width: 22px; height: 22px;
        stroke: currentColor; fill: none;
        stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round;
        flex-shrink: 0;
      }

      /* Desktop — vertical rail */
      @media (min-width: 960px) {
        :host {
          position: static;
          background: transparent;
          backdrop-filter: none;
          border-top: none;
          border-right: 1px solid var(--c-hairline-strong);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .brand-rail {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 28px 24px 24px;
          font-family: var(--font-num);
          font-weight: 700;
          font-size: 22px;
          letter-spacing: -0.04em;
          color: var(--c-text-strong);
        }
        .brand-rail .dot { color: var(--c-muted); }
        nav {
          grid-template-columns: 1fr;
          grid-auto-rows: max-content;
          padding: 8px 12px;
          gap: 2px;
          flex: 1;
        }
        a {
          flex-direction: row;
          justify-content: flex-start;
          gap: 14px;
          padding: 12px 14px;
          font-size: 14px;
          font-weight: 500;
          border-radius: 10px;
        }
        a.active { background: var(--c-elevated); }
        a span { font-size: 14px; }
      }
    `)];
    const items = [
      { key: 'dashboard', label: 'Home', href: 'dashboard.html',
        icon: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>' },
      { key: 'calendar', label: 'Calendar', href: 'calendar.html',
        icon: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4M16 3v4"/>' },
      { key: 'loans', label: 'Loans', href: 'loans.html',
        icon: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/>' },
      { key: 'bills', label: 'Bills', href: 'bills.html',
        icon: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6"/>' },
      { key: 'settings', label: 'Settings', href: 'settings.html',
        icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06A2 2 0 1 1 4.13 16.92l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.85a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09c0 .67.4 1.27 1.03 1.56a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9c.29.63.89 1.03 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03z"/>' },
    ];
    root.innerHTML = `
      <div class="brand-rail">tab<span class="dot">.</span></div>
      <nav>${items.map(i => `
        <a data-k="${i.key}" href="${i.href}"><svg viewBox="0 0 24 24">${i.icon}</svg><span>${i.label}</span></a>`).join('')}</nav>`;
  }
  attributeChangedCallback() {
    const k = this.getAttribute('active');
    this.shadowRoot.querySelectorAll('a').forEach(a =>
      a.classList.toggle('active', a.dataset.k === k));
  }
}

/* ---------- <tab-empty> ---------- */
class TabEmpty extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [css(tokens + `
      :host { display: block; }
      .e {
        text-align: center;
        padding: 48px 20px;
        color: var(--c-muted);
      }
      .glyph {
        width: 56px; height: 56px;
        border-radius: 50%;
        background: var(--c-elevated);
        margin: 0 auto 16px;
        display: grid; place-items: center;
        color: var(--c-text-strong);
        font-size: 22px;
        border: 1px solid var(--c-hairline-strong);
      }
      ::slotted([slot="title"]) {
        display: block;
        color: var(--c-text-strong);
        font-weight: 600;
        font-size: 17px;
        margin-bottom: 6px;
      }
    `)];
    root.innerHTML = `
      <div class="e">
        <div class="glyph"><slot name="glyph">·</slot></div>
        <slot name="title"></slot>
        <slot></slot>
      </div>
    `;
  }
}

/* ---------- register ---------- */
const reg = (name, ctor) => { if (!customElements.get(name)) customElements.define(name, ctor); };
reg('tab-button',  TabButton);
reg('tab-card',    TabCard);
reg('tab-input',   TabInput);
reg('tab-amount',  TabAmount);
reg('tab-avatar',  TabAvatar);
reg('tab-badge',   TabBadge);
reg('tab-row',     TabRow);
reg('tab-divider', TabDivider);
reg('tab-header',  TabHeader);
reg('tab-nav',     TabNav);
reg('tab-empty',   TabEmpty);
