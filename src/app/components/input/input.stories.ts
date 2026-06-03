import type { Meta, StoryObj } from '@storybook/angular';
import { InputComponent } from './input.component';

const meta: Meta<InputComponent> = {
  title: 'Components/Input',
  component: InputComponent,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'light' },
  },
  argTypes: {
    state: {
      control: { type: 'select' },
      options: ['default', 'focused', 'error', 'disabled'],
    },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    errorMessage: { control: 'text' },
    hint: { control: 'text' },
    value: { control: 'text' },
  },
  render: (args) => ({
    props: args,
    template: `
      <app-input
        [label]="label"
        [placeholder]="placeholder"
        [state]="state"
        [errorMessage]="errorMessage"
        [hint]="hint"
        [value]="value"
      ></app-input>
    `,
  }),
};

export default meta;
type Story = StoryObj<InputComponent>;

export const Default: Story = {
  args: {
    label: 'Email address',
    placeholder: 'you@example.com',
    state: 'default',
    value: '',
    hint: 'We will never share your email.',
  },
};

export const Focused: Story = {
  args: {
    label: 'Email address',
    placeholder: 'you@example.com',
    state: 'focused',
    value: 'user@',
    hint: '',
  },
};

export const WithValue: Story = {
  name: 'With Value',
  args: {
    label: 'Full name',
    placeholder: 'Enter your name',
    state: 'default',
    value: 'Jane Doe',
    hint: '',
  },
};

export const Error: Story = {
  args: {
    label: 'Email address',
    placeholder: 'you@example.com',
    state: 'error',
    value: 'not-an-email',
    errorMessage: 'Please enter a valid email address.',
    hint: '',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Email address',
    placeholder: 'you@example.com',
    state: 'disabled',
    value: 'readonly@example.com',
    hint: '',
  },
};
