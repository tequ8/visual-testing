import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="card-header" *ngIf="title || subtitle">
        <h3 class="card-title" *ngIf="title">{{ title }}</h3>
        <p class="card-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="card-body">
        <ng-content></ng-content>
        <p *ngIf="content" class="card-content">{{ content }}</p>
      </div>
      <div class="card-footer" *ngIf="footerText || showFooter">
        <ng-content select="[slot=footer]"></ng-content>
        <span *ngIf="footerText" class="footer-text">{{ footerText }}</span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 320px;
    }

    .card {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .card-header {
      padding: 20px 20px 0 20px;
    }

    .card-title {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }

    .card-subtitle {
      margin: 0;
      font-size: 13px;
      color: #6b7280;
    }

    .card-body {
      padding: 16px 20px;
    }

    .card-content {
      margin: 0;
      font-size: 14px;
      color: #374151;
      line-height: 1.6;
    }

    .card-footer {
      padding: 14px 20px;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }

    .footer-text {
      font-size: 12px;
      color: #6b7280;
    }
  `]
})
export class CardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() content: string = '';
  @Input() footerText: string = '';
  @Input() showFooter: boolean = false;
}
