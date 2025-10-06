import { Directive, ElementRef, EventEmitter, Injector, Output, effect, inject, input } from '@angular/core';
import { CanvasEditStateService } from '../../services/canvas-edit-state/canvas-edit-state.service';
import { BlockUpdate } from 'bie-models';

@Directive()
export abstract class BlockShell<TBlock> {
    readonly editable = input(true);
    readonly totalColumns = input(12);
    readonly block = input.required<TBlock>();

    // DI, ElementRef and Wiring into Canvas
    protected injector = inject(Injector); // Needed for effect()
    protected host = inject<ElementRef<HTMLElement>>(ElementRef);
    protected editState = inject(CanvasEditStateService);

    // Lets editor know when components update
    // Emits the change when blocks gain/lose focus
    @Output() editingChange = new EventEmitter<boolean>();
    // Tracks a block's content and layout
    @Output() update = new EventEmitter<BlockUpdate>();

    // Template methods with typing
    protected setEditing(v: boolean) { this.editingChange.emit(v); }
    protected emitUpdate(patch: BlockUpdate) { this.update.emit(patch); }
    
    // Allows children that need effect() to hook in without needing a constructor
    protected runEffect(fn: () => void) { effect(fn, { injector: this.injector }); }
    protected initEffects(): void {}
    // Schedule init during creation before children can try hook
    private task = queueMicrotask(() => this.initEffects());
}