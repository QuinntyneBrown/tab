import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ApiError,
  AUTH_SERVICE,
  COUNTERPARTY_SERVICE,
  EXPORT_SERVICE,
  ME_SERVICE,
  PREFERENCES_SERVICE,
} from 'api';
import {
  AppShellComponent,
  AvatarComponent,
  ButtonComponent,
  CardComponent,
  HeaderComponent,
  InputComponent,
  NavComponent,
  RowComponent,
} from 'components';

type EditTarget = null | 'counterparty' | 'currency' | 'split' | 'reminders';

@Component({
  selector: 'app-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AppShellComponent,
    AvatarComponent,
    ButtonComponent,
    CardComponent,
    HeaderComponent,
    InputComponent,
    NavComponent,
    RowComponent,
  ],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss',
})
export class SettingsPage {
  private readonly meSvc = inject(ME_SERVICE);
  private readonly counterpartySvc = inject(COUNTERPARTY_SERVICE);
  private readonly preferencesSvc = inject(PREFERENCES_SERVICE);
  private readonly exportSvc = inject(EXPORT_SERVICE);
  private readonly auth = inject(AUTH_SERVICE);
  private readonly router = inject(Router);

  readonly me = this.meSvc.me();
  readonly counterparty = this.counterpartySvc.get();
  readonly preferences = this.preferencesSvc.get();

  /** Which row is currently being edited (null = display mode). */
  readonly editing = signal<EditTarget>(null);

  // Edit-form drafts (initialised from current values when an edit opens).
  readonly draftName = signal('');
  readonly draftCurrency = signal('CAD');
  readonly draftSplit = signal('50');
  readonly draftReminders = signal('3');
  readonly counterpartyError = signal<string | null>(null);
  readonly preferencesError = signal<string | null>(null);
  readonly counterpartySaved = signal(false);

  readonly userDisplayName = computed(() => this.me.value()?.displayName ?? 'You');
  readonly userEmail = computed(() => this.me.value()?.email ?? '');
  readonly userInitialName = computed(() => this.me.value()?.displayName || this.me.value()?.email || 'You');
  readonly counterpartyName = computed(() => this.counterparty.value()?.name ?? '—');
  readonly counterpartyMeta = computed(() => {
    const note = this.counterparty.value()?.description;
    return note ? `Counterparty · ${note}` : 'Counterparty';
  });

  readonly currencyDisplay = computed(() => this.preferences.value()?.currency ?? '—');
  readonly splitDisplay = computed(() => {
    const v = this.preferences.value()?.defaultSplitPercent;
    return v != null ? `${v}%` : '—';
  });
  readonly remindersDisplay = computed(() => {
    const v = this.preferences.value()?.reminderLeadDays;
    return v != null ? `${v} day${v === 1 ? '' : 's'}` : '—';
  });

  /**
   * True once me + counterparty + preferences have all resolved. Wired to
   * `[data-ready]` on the shell so the visual-parity test screenshots a
   * stable render rather than the mid-load frame.
   */
  readonly dataReady = computed(() => {
    const settled = (s: 'idle' | 'loading' | 'success' | 'error') =>
      s === 'success' || s === 'error';
    return settled(this.me.status())
      && settled(this.counterparty.status())
      && settled(this.preferences.status());
  });

  constructor() {
    // Reset drafts from server values whenever they (re)load.
    effect(() => {
      const cp = this.counterparty.value();
      if (cp) this.draftName.set(cp.name);
    });
    effect(() => {
      const prefs = this.preferences.value();
      if (!prefs) return;
      this.draftCurrency.set(prefs.currency);
      this.draftSplit.set(String(prefs.defaultSplitPercent));
      this.draftReminders.set(String(prefs.reminderLeadDays));
    });
  }

  isEditing(target: NonNullable<EditTarget>): boolean {
    return this.editing() === target;
  }

  openEditor(target: NonNullable<EditTarget>): void {
    this.editing.set(target);
    this.counterpartyError.set(null);
    this.preferencesError.set(null);
    this.counterpartySaved.set(false);
  }

  cancelEdit(): void {
    // Reset drafts back to the persisted values before closing.
    const cp = this.counterparty.value();
    if (cp) this.draftName.set(cp.name);
    const prefs = this.preferences.value();
    if (prefs) {
      this.draftCurrency.set(prefs.currency);
      this.draftSplit.set(String(prefs.defaultSplitPercent));
      this.draftReminders.set(String(prefs.reminderLeadDays));
    }
    this.editing.set(null);
  }

  async saveCounterparty(): Promise<void> {
    if (!this.draftName().trim()) {
      this.counterpartyError.set('Name is required');
      return;
    }
    try {
      await this.counterpartySvc.update({ name: this.draftName().trim() });
      this.counterparty.reload();
      this.counterpartyError.set(null);
      this.counterpartySaved.set(true);
      this.editing.set(null);
    } catch (err) {
      this.counterpartyError.set(
        err instanceof ApiError ? err.problem.title : 'Could not save.',
      );
    }
  }

  async savePreferences(): Promise<void> {
    try {
      await this.preferencesSvc.update({
        currency: this.draftCurrency(),
        defaultSplitPercent: Number(this.draftSplit()),
        reminderLeadDays: Number(this.draftReminders()),
      });
      this.preferences.reload();
      this.preferencesError.set(null);
      this.editing.set(null);
    } catch (err) {
      this.preferencesError.set(
        err instanceof ApiError ? err.problem.title : 'Could not save.',
      );
    }
  }

  async exportCsv(): Promise<void> {
    const exported = await this.exportSvc.exportCsv();
    const href = URL.createObjectURL(exported.blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = exported.filename;
    a.click();
    URL.revokeObjectURL(href);
  }

  shareStatement(): void {
    void this.router.navigateByUrl('/statement');
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/login');
  }
}
