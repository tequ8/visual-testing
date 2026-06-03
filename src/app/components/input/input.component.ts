import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormsModule } from '@angular/forms';

export type InputState = 'default' | 'focused' | 'error' | 'disabled';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="input-wrapper" [class.has-error]="state === 'error'">
      <label *ngIf="label" class="input-label" [for]="inputId">{{ label }}</label>
      <input
        [id]="inputId"
        class="input-field"
        [class.focused]="state === 'focused'"
        [class.error]="state === 'error'"
        [disabled]="state === 'disabled'"
        [placeholder]="placeholder"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
      <span *ngIf="state === 'error' && errorMessage" class="error-message">
        {{ errorMessage }}
      </span>
      <span *ngIf="hint && state !== 'error'" class="hint-message">
        {{ hint }}
      </span>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 280px;
    }

    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .input-label {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }

    .input-field {
      padding: 10px 12px;
      border: 1.5px solid #d1d5db;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: #111827;
      background-color: #ffffff;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }

    .input-field::placeholder {
      color: #9ca3af;
    }

    .input-field:hover:not(:disabled):not(.error) {
      border-color: #9ca3af;
    }

    .input-field:focus:not(:disabled):not(.error),
    .input-field.focused:not(:disabled):not(.error) {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }

    .input-field.error {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }

    .input-field:disabled {
      background-color: #f3f4f6;
      color: #9ca3af;
      cursor: not-allowed;
      border-color: #e5e7eb;
    }

    .error-message {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      color: #ef4444;
    }

    .hint-message {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      color: #6b7280;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'Enter text...';
  @Input() state: InputState = 'default';
  @Input() errorMessage: string = 'This field has an error';
  @Input() hint: string = '';
  @Input() inputId: string = `input-${Math.random().toString(36).substr(2, 9)}`;
  @Input() value: string = '';

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }
}
