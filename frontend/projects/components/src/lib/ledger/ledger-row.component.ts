import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Single statement-ledger row. See docs/components/tab-ledger.md.
 *
 * Renders values as plain text (with embedded `$`) rather than via tab-amount,
 * to keep the visual style printerly — flat numerals, no superscripted cents.
 */
@Component({
  selector: 'tab-ledger-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './ledger-row.component.html',
  styleUrl: './ledger-row.component.scss',
})
export class LedgerRowComponent {
  @Input() desc = '';
  @Input() when = '';
  @Input() total: number | null = null;
  @Input() share = 0;
  @Input() shareSign: string | null = null;
  @Input() currency = '$';

  formatted(n: number): string {
    return (
      this.currency +
      n.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
}
