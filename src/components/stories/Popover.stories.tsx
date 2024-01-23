import { HelpCircle } from 'lucide-react';
import React from 'react';
import { DialogTrigger, Heading } from 'react-aria-components';
import { Button } from '../../elements/Button.tsx';
import { Dialog } from '../Dialog.tsx';
import { Popover } from '../Popover.tsx';

export const Example = (args: any) => (
  <DialogTrigger>
    <Button variant="icon" aria-label="Help">
      <HelpCircle className="w-4 h-4" />
    </Button>
    <Popover {...args} className="max-w-[250px]">
      <Dialog>
        <Heading slot="title" className="text-lg font-semibold mb-2">
          Help
        </Heading>
        <p className="text-sm">
          For help accessing your account, please contact support.
        </p>
      </Dialog>
    </Popover>
  </DialogTrigger>
);
