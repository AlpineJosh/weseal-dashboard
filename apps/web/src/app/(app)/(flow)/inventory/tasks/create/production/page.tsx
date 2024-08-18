"use client";

import { Flow } from "@repo/ui/components/navigation";
import { List } from "@repo/ui/components/display";

import { Button } from "@repo/ui/components/element";
import { useState } from "react";

import { api } from "~/trpc/react";
import { Field, Form } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/control";

export default function CreateProductionTask() {
  const [task, setTask] = useState<Partial<CreateTaskInput>>({
    
  });

  const [component, setComponent] = useState();
  return (
      <Flow>
        {({ next }) => (
          <>
            <Flow.Step id="select-component" title="Select Component">
              <List useItemsQuery={api.component.all.useQuery}>
                {(item) => (
                  <List.Item
                    onAction={(item) => {
                      setComponent(item);
                      next();
                    }}
                  >
                    {item.name}
                  </List.Item>
                )}
              </List>
            </Flow.Step>
            <Flow.Step id="confirm quantity" title="Select Production Order">
              <Form
                onSubmit={(values) => {
                  setQuantity(values.quantity);
                  nextStep();
                }}
              >
                <Field name="quantity" defaultValue={1}>
                  <Field.Label>Quantity</Field.Label>
                  <Field.Control>
                    <Input type="number" />
                  </Field.Control>
                </Field>
                <Button type="submit">Next</Button>
              </Form>
            </Flow.Step>
            <Flow.Step id="locations">
              <InventoryLocationSelector components={} />
            </Flow.Step>
          </>
        )}
      </Flow>
  );
}
