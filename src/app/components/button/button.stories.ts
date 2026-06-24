import type { Meta, StoryObj } from '@storybook/angular';
import { userEvent, within } from 'storybook/test';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'light' },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size" [disabled]="disabled">Click me</app-button>`,
  }),
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
};

export const SmallPrimary: Story = {
  name: 'Small Primary',
  args: {
    variant: 'primary',
    size: 'sm',
    disabled: false,
  },
};

export const MediumPrimary: Story = {
  name: 'Medium Primary',
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
};

export const LargePrimary: Story = {
  name: 'Large Primary',
  args: {
    variant: 'primary',
    size: 'lg',
    disabled: false,
  },
};

export const SmallSecondary: Story = {
  name: 'Small Secondary',
  args: {
    variant: 'secondary',
    size: 'sm',
    disabled: false,
  },
};

export const LargeSecondary: Story = {
  name: 'Large Secondary',
  args: {
    variant: 'secondary',
    size: 'lg',
    disabled: false,
  },
};

export const PrimaryHover: Story = {
  name: 'Primary Hover',
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    await userEvent.hover(button);
  },
};

export const SecondaryHover: Story = {
  name: 'Secondary Hover',
  args: {
    variant: 'secondary',
    size: 'md',
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    await userEvent.hover(button);
  },
};
