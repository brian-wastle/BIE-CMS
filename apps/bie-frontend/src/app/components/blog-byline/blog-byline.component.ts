import { Component, input, inject, signal, computed, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-byline-block',
  standalone: true,
  imports: [CommonModule, DatePipe, CdkDrag],
  template: `
    <div class="byline" cdkDrag [cdkDragDisabled]="!draggable()"
         [cdkDragData]="{ type: 'byline', name: name() }">
      <span class="name">{{ name() }}</span>
      <span class="dot">•</span>
      <time [attr.datetime]="isoNow()" [title]="isoNow()">
        {{ now() | date: format() }}
      </time>
      <ng-content select="[controls]"></ng-content>
    </div>
  `,
  styles: [`
    .byline{ display:inline-flex; align-items:center; gap:.5rem;
             font:600 .95rem/1.2 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial }
    .name{ letter-spacing:.2px }
    .dot{ opacity:.5 }
    time{ opacity:.8 }
  `]
})
export class BylineBlockComponent implements OnInit {
  readonly name = input.required<string>();
  readonly format = input('EEEE, MMM d, y, h:mm a');
  readonly live = input(true);
  readonly draggable = input(true);

  private platformId = inject(PLATFORM_ID);

  private _now = signal(new Date());
  now = this._now.asReadonly();
  isoNow = computed(() => this._now().toISOString());

  private _timer: any;

  ngOnInit() {
    if (this.live() && isPlatformBrowser(this.platformId)) {
      const tick = () => {
        this._now.set(new Date());
        const msToNextMinute = 60000 - (Date.now() % 60000);
        this._timer = setTimeout(tick, msToNextMinute);
      };
      this._timer = setTimeout(tick, 0);
    }
  }
  ngOnDestroy() { if (this._timer) clearTimeout(this._timer); }
}