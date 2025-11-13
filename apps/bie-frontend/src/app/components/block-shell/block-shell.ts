import { Directive, forwardRef, input, InjectionToken } from '@angular/core';

export const BLOCK_SHELL = new InjectionToken<BlockShell<unknown>>('BlockShell');

@Directive({
  providers: [{ provide: BLOCK_SHELL, useExisting: forwardRef(() => BlockShell) }],
})
export abstract class BlockShell<TBlock> {
  readonly block = input.required<TBlock>();
}