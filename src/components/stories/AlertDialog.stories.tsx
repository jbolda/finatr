import React from 'react';
import { DialogTrigger } from 'react-aria-components';
import { AlertDialog } from '../AlertDialog.tsx';
import { Button } from '../../elements/Button.tsx';
import { Modal } from '../Modal.tsx';

export const Example = (args: any) => (
  <DialogTrigger>
    <Button variant="secondary">Delete…</Button>
    <Modal>
      <AlertDialog {...args} />
    </Modal>
  </DialogTrigger>
);

Example.args = {
  title: 'Delete folder',
  children:
    'Are you sure you want to delete "Documents"? All contents will be permanently destroyed.',
  variant: 'destructive',
  actionLabel: 'Delete'
};
