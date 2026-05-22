import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ApiError,
  AUTH_SERVICE,
  COUNTERPARTY_SERVICE,
  EXPORT_SERVICE,
  PREFERENCES_SERVICE,
} from 'api';
import {
  AppShellComponent,
  ButtonComponent,
  CardComponent,
  HeaderComponent,
  InputComponent,
  NavComponent,
  SectionHeadComponent,
} from 'components';

@Component({
  selector: 'app-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AppShellComponent,
    ButtonComponent,
    CardComponent,
    HeaderComponent,
    InputComponent,
    NavComponent,
    SectionHeadComponent,
  ],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss',
})
export class SettingsPage {
  private readonly counterpartySvc = inject(COUNTERPARTY_SERVICE);
  private readonly preferencesSvc = inject(PREFERENCES_SERVICE);
  private readonly exportSvc = inject(EXPORT_SERVICE);
  private readonly auth = inject(AUTH_SERVICE);
  private readonly router = inject(Router);

  readonly counterparty = this.counterpartySvc.get();
  readonly preferences = this.preferencesSvc.get();

  readonly name = signal('');
  readonly currency = signal('CAD');
  readonly defaultSplit = signal('50');
  readonly reminderLead = signal('3');
  readonly counterpartyError = signal<string | null>(null);
  readonly preferencesError = signal<string | null>(null);
  readonly counterpartySaved = signal(false);

  constructor() {
    effect(() => {
      const cp = this.counterparty.value();
      if (cp) this.name.set(cp.name);
    });
    effect(() => {
      const prefs = this.preferences.value();
      if (!prefs) return;
      this.currency.set(prefs.currency);
      this.defaultSplit.set(String(prefs.defaultSplitPercent));
      this.reminderLead.set(String(prefs.reminderLeadDays));
    });
  }

  async saveCounterparty(): Promise<void> {
    if (!this.name().trim()) {
      this.counterpartyError.set('Name is required');
      return;
    }
    try {
      await this.counterpartySvc.update({ name: this.name().trim() });
      this.counterparty.reload();
      this.counterpartyError.set(null);
      this.counterpartySaved.set(true);
    } catch (err) {
      this.counterpartyError.set(
        err instanceof ApiError ? err.problem.title : 'Could not save.',
      );
    }
  }

  async savePreferences(): Promise<void> {
    try {
      await this.preferencesSvc.update({
        currency: this.currency(),
        defaultSplitPercent: Number(this.defaultSplit()),
        reminderLeadDays: Number(this.reminderLead()),
      });
      this.preferences.reload();
      this.preferencesError.set(null);
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

  async signOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/login');
  }
}
