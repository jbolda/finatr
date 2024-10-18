import React from 'react';
import {
  TextField as AriaTextField,
  TextFieldProps as AriaTextFieldProps
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import {
  Description,
  FieldError,
  Input,
  Label,
  fieldBorderStyles
} from './Field.tsx';
import { composeTailwindRenderProps, focusRing } from './utils.ts';

const inputStyles = tv({
  extend: focusRing,
  base: 'border-2 rounded-md',
  variants: {
    isFocused: fieldBorderStyles.variants.isFocusWithin,
    ...fieldBorderStyles.variants
  }
});

export interface TextFieldProps extends AriaTextFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string;
}

export function TextField({
  label,
  description,
  errorMessage,
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        'flex flex-col gap-1'
      )}
    >
      {label && <Label>{label}</Label>}
      <Input className={inputStyles} />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
