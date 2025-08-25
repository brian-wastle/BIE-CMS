import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CanvasEditStateService {
  private _active = signal(false);
  readonly active = this._active.asReadonly();

  setEditing(setting: boolean) { this._active.set(setting); }

  // Helpers
  start() { this._active.set(true); }
  stop()  { this._active.set(false); }
}
