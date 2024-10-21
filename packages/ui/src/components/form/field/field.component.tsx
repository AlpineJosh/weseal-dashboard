"use client";

import type { ComponentPropsWithRef } from "react";
import type {
  FieldPath,
  FieldPathValue,
  FieldValues,
  Noop,
  UseControllerReturn,
} from "react-hook-form";
import type { Updater } from "use-immer";
import React, { createContext, useContext, useEffect, useId } from "react";
import * as Aria from "react-aria-components";
import { useController } from "react-hook-form";
import { useImmer } from "use-immer";

import { cn } from "@repo/ui/lib/class-merge";

import type { TextProps } from "../../typography";
import { Text } from "../../typography";

interface FieldIds {
  fieldId: string;
  controlId: string;
  labelId: string;
  descriptionId: string;
  messageId: string;
}

type FieldContextValue<TFieldValues extends FieldValues = FieldValues> =
  UseControllerReturn<TFieldValues> & {
    ids: FieldIds;
    setIds: Updater<FieldIds>;
  };

const FieldContext = createContext<FieldContextValue>({} as FieldContextValue);

type FieldProps = ComponentPropsWithRef<"div"> & {
  name: string;
};

// type FieldReturn = {
//   ids: FieldIds;
//   control: UseFormRegisterReturn &
//       InputHTMLAttributes<HTMLInputElement> &
//       React.RefCallback<HTMLInputElement>;
//   label: Aria.LabelProps;
//   description: Aria.TextProps;
//   message: Aria.FieldErrorProps;
// }

const useFormField = () => {
  const { ids, field, fieldState, setIds } = useContext(FieldContext);

  return {
    control: {
      id: ids.controlId,
      "aria-describedby": fieldState.error
        ? `${ids.descriptionId} ${ids.messageId}`
        : ids.descriptionId,
      "aria-invalid": fieldState.invalid,
      "aria-labelledby": ids.labelId,
      "aria-disabled": field.disabled,
      ...field,
    },
    label: {
      id: ids.labelId,
      htmlFor: ids.controlId,
    },
    description: {
      id: ids.descriptionId,
    },
    message: {
      id: ids.messageId,
      children: fieldState.error?.message
        ? String(fieldState.error.message)
        : undefined,
      invalid: fieldState.invalid,
    },
    fieldState,
    setIds,
  };
};

const Root = ({ id, name, children, className, ...props }: FieldProps) => {
  const control = useController({ name });

  const fieldId = useId();
  id ??= fieldId;

  const [ids, setIds] = useImmer<FieldIds>({
    fieldId: fieldId,
    controlId: `${fieldId}-control`,
    labelId: `${fieldId}-label`,
    descriptionId: `${fieldId}-description`,
    messageId: `${fieldId}-message`,
  });

  return (
    <FieldContext.Provider value={{ ids, setIds, ...control }}>
      <div
        className={cn(
          "flex flex-col",
          "[&>[data-slot=label]+[data-slot=control]]:mt-3",
          "[&>[data-slot=label]+[data-slot=description]]:mt-1",
          "[&>[data-slot=description]+[data-slot=control]]:mt-3",
          "[&>[data-slot=control]+[data-slot=description]]:mt-3",
          "[&>[data-slot=control]+[data-slot=error]]:mt-3",
          "[&>[data-slot=label]]:font-medium",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </FieldContext.Provider>
  );
};
Root.displayName = "Field.Root";

type LabelProps = Aria.LabelProps;

const Label = ({ id, className, ...props }: LabelProps) => {
  const { label, setIds } = useFormField();

  useEffect(() => {
    if (id !== undefined && id !== label.id) {
      setIds((draft) => {
        draft.labelId = id;
      });
    }
  }, [id, label.id, setIds]);

  return (
    <Aria.Label
      data-slot="label"
      className={cn("invalid:text-destructive", className)}
      {...label}
      {...props}
    />
  );
};
Label.displayName = "Field.Label";

export interface ControlRenderProps<TValue> {
  id?: string;
  onChange: (value: TValue) => void;
  onBlur: Noop;
  value: TValue;
  name: string;
  ref: React.RefCallback<HTMLInputElement>;
}

interface ControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  children: React.ReactElement<
    ControlRenderProps<FieldPathValue<TFieldValues, TName>>
  >;
}

const Control = ({ children }: ControlProps) => {
  const {
    setIds,
    control: { ref: _, ...control },
  } = useFormField();

  const childId = children.props.id;
  useEffect(() => {
    if (childId !== undefined && childId !== control.id) {
      setIds((draft) => {
        draft.controlId = childId;
      });
    }
  }, [childId, control.id, setIds]);

  return React.cloneElement(children, control);
};
Control.displayName = "Field.Control";

const Description = ({ id, className, ...props }: TextProps) => {
  const { description, setIds } = useFormField();

  useEffect(() => {
    if (id !== undefined && id !== description.id) {
      setIds((draft) => {
        draft.descriptionId = id;
      });
    }
  }, [id, description.id, setIds]);

  return (
    <Text
      data-slot="description"
      {...description}
      {...props}
      className={cn("text-xs text-content-muted", className)}
    />
  );
};
Description.displayName = "Field.Description";

const Message = ({ className, children, ...props }: TextProps) => {
  const { message } = useFormField();
  children = message.children ?? children;

  if (!children) {
    return null;
  }

  return (
    <Text
      data-slot="message"
      className={cn(
        className,
        "text-xs font-medium text-content-muted invalid:text-destructive",
      )}
      {...message}
      {...props}
    >
      {children}
    </Text>
  );
};
Message.displayName = "Field.Message";

const FieldGroup = ({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"div">) => {
  return (
    <div data-slot="control" {...props} className={cn("space-y-8", className)}>
      {children}
    </div>
  );
};
FieldGroup.displayName = "Field.Group";

const Field = Object.assign(Root, {
  Label,
  Control,
  Description,
  Message,
});
export { Field, FieldGroup };

export type { FieldProps, ControlProps };
