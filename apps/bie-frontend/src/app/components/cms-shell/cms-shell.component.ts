import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';

import { RouterOutlet, RouterLink, Router, ActivatedRoute } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cms-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule
],
  templateUrl: './cms-shell.component.html',
  styleUrls: ['./cms-shell.component.scss'],
})
export class CmsShellComponent implements OnInit {
  title = 'BLOGKS';
  readonly arrowImg = 'assets/dirarrow.webp';
  private bp = inject(BreakpointObserver);
  sidenavMode: 'side' | 'over' = 'side';
  sidenavOpened = true;
  opened: WritableSignal<boolean> = signal(true);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  pageTitle = signal<string>('');

  ngOnInit(): void {
    this.bp.observe('(max-width: 768px)').subscribe(res => {
      if (res.matches) {
        this.sidenavMode = 'over';
        this.sidenavOpened = false;
        this.opened.set(false);
      } else {
        this.sidenavMode = 'side';
        this.sidenavOpened = true;
        this.opened.set(true);
      }
    });
  }

  onActivate(cmp: any) {
    this.pageTitle.set(cmp?.pageTitle ?? this.route.firstChild?.snapshot.data['pageTitle'] ?? '');
  }

  toggleNavState() {
    this.sidenavOpened = !this.sidenavOpened;
    this.opened.set(this.sidenavOpened);
  }
}
