"use client";

import type { ComponentPropsWithoutRef, ForwardedRef } from "react";
import { forwardRef } from "react";
import { useObjectRef } from "react-aria";
import { ComboBox, ComboBoxProps } from "react-aria-components";

const Root = forwardRef(
  <T extends object>(
    props: ComboBoxProps<T>,
    ref: ForwardedRef<typeof ComboBox<T>>,
  ) => {
    let objRef = useObjectRef(ref);
    return <ComboBox ref={objRef} {...props} />;
  },
);

const Input = forwardRef(
  <T extends object>(
    props: ComboBoxInputProps<T>,
    ref: ForwardedRef<typeof ComboBoxInput<T>>,
  ) => {
    let objRef = useObjectRef(ref);
    return <Input ref={objRef} {...props} />;
  },
);

export default { Root };
