import { ChevronDown } from 'lucide-react';
import React from 'react';
import type { ReactNode } from 'react';
import { ComboBox as AriaComboBox, ListBox } from 'react-aria-components';
import type {
  ComboBoxProps as AriaComboBoxProps,
  ListBoxItemProps,
  ValidationResult
} from 'react-aria-components';

import { Button } from '../elements/Button.tsx';
import {
  Description,
  FieldError,
  FieldGroup,
  Input,
  Label
} from '../elements/Field.tsx';
import { composeTailwindRenderProps } from '../elements/utils.ts';
import { DropdownItem, DropdownSection } from './ListBox.tsx';
import type { DropdownSectionProps } from './ListBox.tsx';
import { Popover } from './Popover.tsx';

export interface ComboBoxProps<T extends object>
  extends Omit<AriaComboBoxProps<T>, 'children'> {
  label?: string;
  description?: string | null;
  errorMessage?: string | ((validation: ValidationResult) => string);
  children: ReactNode | ((item: T) => ReactNode);
}

export function ComboBox<T extends object>({
  label,
  description,
  errorMessage,
  children,
  items,
  ...props
}: ComboBoxProps<T>) {
  return (
    <AriaComboBox
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        'group flex flex-col gap-1'
      )}
    >
      <Label>{label}</Label>
      <FieldGroup>
        <Input />
        <Button variant="icon" className="w-6 mr-1 rounded outline-offset-0 ">
          <ChevronDown aria-hidden className="w-4 h-4" />
        </Button>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage as unknown as React.ReactNode}</FieldError>
      <Popover className="w-[--trigger-width]">
        <ListBox
          items={items}
          className="outline-0 p-1 max-h-[inherit] overflow-auto [clip-path:inset(0_0_0_0_round_.75rem)]"
        >
          {children}
        </ListBox>
      </Popover>
    </AriaComboBox>
  );
}

export function ComboBoxItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}

export function ComboBoxSection<T extends object>(
  props: DropdownSectionProps<T>
) {
  return <DropdownSection {...props} />;
}
