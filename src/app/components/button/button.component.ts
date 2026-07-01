import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `<button
    [class]="buttonClasses"
    [disabled]="disabled"
    type="button"
  >
    <ng-content></ng-content>
  </button>`,
  styles: [`
    :host {
      display: inline-block;
    }

    button {
      cursor: pointer;
      border: none;
      border-radius: 4px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 600;
      line-height: 1;
      transition: background-color 0.2s ease, opacity 0.2s ease, transform 0.1s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
    }

    button:focus-visible {
      outline: 2px solid #4f46e5;
      outline-offset: 2px;
    }

    /* Sizes */
    button.size-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    button.size-md {
      padding: 10px 20px;
      font-size: 14px;
    }

    button.size-lg {
      padding: 50px 28px;
      font-size: 16px;
    }

    /* Variants */
    button.variant-primary {
      background-color: #4f46e5;
      color: #ffffff;
    }

    button.variant-primary:hover:not(:disabled) {
      background-color: #4338ca;
    }

    button.variant-primary:active:not(:disabled) {
      background-color: #3730a3;
      transform: translateY(1px);
    }

    button.variant-secondary {
      background-color: transparent;
      color: #4f46e5;
      border: 2px solid #4f46e5;
    }

    button.variant-secondary:hover:not(:disabled) {
      background-color: #eef2ff;
    }

    button.variant-secondary:active:not(:disabled) {
      background-color: #e0e7ff;
      transform: translateY(1px);
    }

    /* Disabled */
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled: boolean = false;

  get buttonClasses(): string {
    return `variant-${this.variant} size-${this.size}`;
  }
}
