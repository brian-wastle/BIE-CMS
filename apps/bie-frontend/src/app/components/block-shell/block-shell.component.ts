import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridPlacement } from 'bie-models';
import { LayoutControlsComponent } from '../layout-controls/layout-controls.component';


/** Minimal shape required by the shell */
export interface ShellBlockLike { layout: GridPlacement }


@Component({
    selector: 'app-block-shell',
    standalone: true,
    imports: [CommonModule, LayoutControlsComponent],
    templateUrl: './block-shell.component.html',
    styleUrls: ['./block-shell.component.scss']
})
export class BlockShellComponent {
    @Input({ required: true }) block!: ShellBlockLike;
    @Input() editable = true;
    @Input() totalColumns = 12;

    @Output() editingChange = new EventEmitter<boolean>();
    @Output() layoutChange = new EventEmitter<GridPlacement>();

    constructor(private host: ElementRef<HTMLElement>) { }

    emitEditing(status: boolean) { 
        this.editingChange.emit(status); 
    }
    onLayoutChange(layout: GridPlacement) {
        this.layoutChange.emit(layout);
    }
    onFocusOut(e: FocusEvent) {
        const next = e.relatedTarget as Node | null;
        const root = this.host.nativeElement;
        if (!next || !root.contains(next)) this.editingChange.emit(false);
    }
}