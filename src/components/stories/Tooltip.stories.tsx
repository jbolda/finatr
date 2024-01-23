import { PrinterIcon, SaveIcon } from 'lucide-react';
import React from 'react';
import { TooltipTrigger } from 'react-aria-components';
import { Button } from '../../elements/Button.tsx';
import { Tooltip } from '../Tooltip.tsx';

export const Example = (args: any) => (
  <div className="flex gap-2">
    <TooltipTrigger>
      <Button variant="secondary" className="px-2">
        <SaveIcon className="w-5 h-5" />
      </Button>
      <Tooltip {...args}>Save</Tooltip>
    </TooltipTrigger>
    <TooltipTrigger>
      <Button variant="secondary" className="px-2">
        <PrinterIcon className="w-5 h-5" />
      </Button>
      <Tooltip {...args}>Print</Tooltip>
    </TooltipTrigger>
  </div>
);
