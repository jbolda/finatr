import React from 'react';
import { Slider } from '../Slider.tsx';

export const Example = (args: any) => <Slider {...args} />;

Example.args = {
  label: 'Range',
  defaultValue: [30, 60],
  thumbLabels: ['start', 'end']
};
