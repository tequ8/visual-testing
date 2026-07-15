import type { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: './storybook-static',
  },
  failOnDifference: true,

  // Lost Pixel Platform (hosted review UI) — comment out storybookShots above
  // and uncomment these two lines to switch from OSS mode to Platform mode:
  // lostPixelProjectId: 'xxxx',
  // apiKey: process.env['LOST_PIXEL_API_KEY'],
};
