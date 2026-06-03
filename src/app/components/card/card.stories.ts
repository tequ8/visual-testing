import type { Meta, StoryObj } from '@storybook/angular';
import { CardComponent } from './card.component';
import { ButtonComponent } from '../button/button.component';

const meta: Meta<CardComponent> = {
  title: 'Components/Card',
  component: CardComponent,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'light' },
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    content: { control: 'text' },
    footerText: { control: 'text' },
    showFooter: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Simple: Story = {
  render: (args) => ({
    props: args,
    template: `
      <app-card
        [title]="title"
        [content]="content"
      ></app-card>
    `,
  }),
  args: {
    title: 'Card Title',
    content: 'This is the main content of the card. It can contain any text or description that is relevant to the card.',
  },
};

export const WithSubtitle: Story = {
  name: 'With Subtitle',
  render: (args) => ({
    props: args,
    template: `
      <app-card
        [title]="title"
        [subtitle]="subtitle"
        [content]="content"
      ></app-card>
    `,
  }),
  args: {
    title: 'User Profile',
    subtitle: 'Account settings and preferences',
    content: 'Manage your personal information, security settings, and notification preferences from this panel.',
  },
};

export const WithFooter: Story = {
  name: 'With Footer',
  render: (args) => ({
    moduleMetadata: {
      imports: [ButtonComponent],
    },
    props: args,
    template: `
      <app-card
        [title]="title"
        [subtitle]="subtitle"
        [content]="content"
        [showFooter]="true"
      >
        <div slot="footer">
          <app-button variant="secondary" size="sm">Cancel</app-button>
          <app-button variant="primary" size="sm">Save Changes</app-button>
        </div>
      </app-card>
    `,
  }),
  args: {
    title: 'Edit Profile',
    subtitle: 'Update your information',
    content: 'Make changes to your profile information below. Click save when you are done.',
  },
};

export const WithFooterText: Story = {
  name: 'With Footer Text',
  render: (args) => ({
    props: args,
    template: `
      <app-card
        [title]="title"
        [content]="content"
        [footerText]="footerText"
      ></app-card>
    `,
  }),
  args: {
    title: 'Notification',
    content: 'Your subscription will renew automatically on the next billing date.',
    footerText: 'Last updated: June 1, 2025',
  },
};

export const ContentOnly: Story = {
  name: 'Content Only',
  render: (args) => ({
    props: args,
    template: `
      <app-card [content]="content"></app-card>
    `,
  }),
  args: {
    content: 'A simple card with no title or footer, just content text.',
  },
};
