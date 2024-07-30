"use client";

import { z } from "zod";

import { ComboboxDemo } from "@repo/ui/components/combobox/combobox";
import { Field, Form } from "@repo/ui/components/form/index";
// import { Input } from "@repo/ui/components/input/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select/select";

const taskSchema = z.object({
  componentId: z.string().min(10),
});

export default function CreateProductionTaskPage() {
  // const form = useForm<z.infer<typeof taskSchema>>({
  //   resolver: zodResolver(taskSchema),
  //   defaultValues: {
  //     componentId: "",
  //     quantity: 1,
  //   },
  // });

  return (
    <div>
      <h1>Create Production Task</h1>
      <Form
        defaultValues={{
          componentI: "",
          quantit: 1,
        }}
        schema={taskSchema}
        onSubmit={(data) => {
          console.log(data);
        }}
      >
        <Field.Root name="componentId">
          <Field.Label>Component</Field.Label>
          <Field.Control>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a component" />
              </SelectTrigger>
            </Select>
          </Field.Control>
          <Field.Description>The component to produce.</Field.Description>
          <Field.Message />
        </Field.Root>

        <Field.Root name="quantity">
          <Field.Label>Quantity</Field.Label>
          <Field.Control>
            <ComboboxDemo />
          </Field.Control>
        </Field.Root>

        <Field.Root name="component">
          <Field.Label>Component</Field.Label>
          <Field.Control>
            <Combobox.Root>
              <Combobox.Trigger placeholder="Select a component" />
              <Combobox.Content>
                <Combobox.Input placeholder="Search..." />
                {({ query }) => (
                  <Combobox.Options>
                    {components.map((component) => (
                      <Combobox.Option
                        key={component.id}
                        value={component.id}
                      />
                    ))}
                  </Combobox.Options>
                )}
              </Combobox.Content>
            </Combobox.Root>
          </Field.Control>
        </Field.Root>
      </Form>
    </div>
  );
}
