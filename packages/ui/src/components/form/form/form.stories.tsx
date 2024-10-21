import type { Meta, StoryObj } from "@storybook/react";
import type { FieldValues } from "react-hook-form";
import { useForm } from "react-hook-form";

import type { FormProps } from "./form.component";
import { Checkbox, Combobox, Input, Select, Switch } from "../../control";
import { AsyncCombobox } from "../../control/combobox/combobox.component";
import { Field, FieldGroup } from "../field";
import { Form } from "./form.component";

const meta: Meta<FormProps<FieldValues>> = {
  title: "Form/Form",
  component: Form,
};

export default meta;

type Story = StoryObj<FormProps<FieldValues>>;

const DefaultForm = (props: FormProps<FieldValues>) => {
  const form = useForm<FieldValues>({
    defaultValues: {
      text: "",
      checkbox: false,
      switch: false,
      textarea: "",
      select: null,
      combobox: null,
      "combobox-async": null,
    },
  });

  const values = form.watch();

  return (
    <div className="flex flex-row gap-12">
      <Form {...props} form={form}>
        <FieldGroup>
          <Field name="text">
            <Field.Label>Text</Field.Label>
            <Field.Description>Text description</Field.Description>
            <Field.Control>
              <Input type="text" />
            </Field.Control>
            <Field.Message>Text help</Field.Message>
          </Field>
          <Field name="checkbox">
            <Field.Label>Checkbox</Field.Label>
            <Field.Description>Checkbox description</Field.Description>
            <Field.Control>
              <Checkbox />
            </Field.Control>
            <Field.Message>Checkbox help</Field.Message>
          </Field>
          <Field name="switch">
            <Field.Label>Switch</Field.Label>
            <Field.Description>Switch description</Field.Description>
            <Field.Control>
              <Switch />
            </Field.Control>
            <Field.Message>Switch help</Field.Message>
          </Field>
          <Field name="textarea">
            <Field.Label>Text</Field.Label>
            <Field.Description>Text description</Field.Description>
            <Field.Control>
              <Input type="textarea" />
            </Field.Control>
            <Field.Message>Textarea help</Field.Message>
          </Field>
          <Field name="select">
            <Field.Label>Select</Field.Label>
            <Field.Description>Select description</Field.Description>
            <Field.Control>
              <Select>
                <Select.Option id={1}>Option 1</Select.Option>
                <Select.Option id={2}>Option 2</Select.Option>
                <Select.Option id={3}>Option 3</Select.Option>
              </Select>
            </Field.Control>
            <Field.Message>Select help</Field.Message>
          </Field>
          <Field name="combobox">
            <Field.Label>Combobox</Field.Label>
            <Field.Description>Combobox description</Field.Description>
            <Field.Control>
              <Combobox>
                <Combobox.Option id={1} textValue="Option 1">
                  Option 1
                </Combobox.Option>
                <Combobox.Option id={2} textValue="Option 2">
                  Option 2
                </Combobox.Option>
                <Combobox.Option id={3} textValue="Option 3">
                  Option 3
                </Combobox.Option>
              </Combobox>
            </Field.Control>
            <Field.Message>Combobox help</Field.Message>
          </Field>
          <Field name="combobox-async">
            <Field.Label>Combobox Async</Field.Label>
            <Field.Description>Combobox Async description</Field.Description>
            <Field.Control>
              <AsyncCombobox
                keyAccessor={(item) => item.id}
                data={() => ({
                  items: [
                    { id: 1, name: "Option 1" },
                    { id: 2, name: "Option 2" },
                    { id: 3, name: "Option 3" },
                  ],
                  isLoading: false,
                })}
              >
                {(item) => (
                  <AsyncCombobox.Option id={item.id}>
                    {item.name}
                  </AsyncCombobox.Option>
                )}
              </AsyncCombobox>
            </Field.Control>
          </Field>
        </FieldGroup>
      </Form>
      <div className="w-64">
        <pre>{JSON.stringify(values, null, 2)}</pre>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <DefaultForm {...args} />,
};
