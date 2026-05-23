/*
 * Public API Surface of @tab/components
 *
 * Every exported component is documented in docs/components/<selector>.md and
 * mirrors a web-component from docs/mocks/assets/js/components.js with 100%
 * visual parity.
 */

/* Primitives — 1:1 with the mocks' web components */
export * from './lib/amount/amount.component';
export * from './lib/avatar/avatar.component';
export * from './lib/badge/badge.component';
export * from './lib/button/button.component';
export * from './lib/card/card.component';
export * from './lib/divider/divider.component';
export * from './lib/empty/empty.component';
export * from './lib/header/header.component';
export * from './lib/input/input.component';
export * from './lib/nav/nav.component';
export * from './lib/row/row.component';

/* Composition components recurring across screens */
export * from './lib/add-loan-dialog/add-loan-dialog.component';
export * from './lib/log-bill-payment-dialog/log-bill-payment-dialog.component';
export * from './lib/record-payment-dialog/record-payment-dialog.component';
export * from './lib/amount-input/amount-input.component';
export * from './lib/app-shell/app-shell.component';
export * from './lib/bill-card/bill-card.component';
export * from './lib/brand/brand.component';
export * from './lib/calendar-agenda/calendar-agenda.component';
export * from './lib/calendar-agenda/agenda-day.interface';
export * from './lib/calendar-agenda/agenda-row.interface';
export * from './lib/calendar-agenda/agenda-row-activated.event';
export * from './lib/calendar-agenda/agenda-filter.type';
export * from './lib/calendar-grid/calendar-grid.component';
export * from './lib/calendar-grid/calendar-cell.interface';
export * from './lib/calendar-grid/calendar-chip.interface';
export * from './lib/calendar-grid/calendar-chip-activated.event';
export * from './lib/eyebrow/eyebrow.component';
export * from './lib/icon/icon.component';
export * from './lib/ledger/ledger.component';
export * from './lib/ledger/ledger-row.component';
export * from './lib/month-section/month-section.component';
export * from './lib/nudge/nudge.component';
export * from './lib/section-head/section-head.component';
export * from './lib/segmented/segmented.component';
export * from './lib/stat-card/stat-card.component';
export * from './lib/totals/totals.component';
export * from './lib/totals/totals-row.component';
