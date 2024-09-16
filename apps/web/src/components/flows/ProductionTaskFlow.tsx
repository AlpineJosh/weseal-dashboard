"use client";

import { LocationPicker } from "@/components/LocationPicker";
import { SearchableListbox } from "@/components/SearchableListbox";
import { api } from "@/utils/trpc/react";
import { useImmer } from "use-immer";
import { z } from "zod";

import type { RouterInputs, RouterOutputs } from "@repo/api";
import type { FlowStepRendererProps } from "@repo/ui/components/navigation";
import { Combobox, Input, Select } from "@repo/ui/components/control";
import { Table } from "@repo/ui/components/display";
import { Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";
import { Card } from "@repo/ui/components/layout";
import { Flow } from "@repo/ui/components/navigation";

// const SearchableListbox: React.FC<any> = (props) => {
//   return <div>Placeholder</div>;
// };

export function ProductionTaskForm() {
  return (
    <Form
      onSubmit={() => {}}
      schema={z.object({
        component: z.string(),
        job: z.string(),
        quantity: z.number(),
      })}
    >
      <Field name="component">
        <Field.Label>Component</Field.Label>
        <Field.Description>Select the component to build</Field.Description>
        <Field.Control>
          <Combobox
            options={(query) => {
              return api.component.list.useQuery({
                filter: {
                  search: query,
                },
              });
            }}
          >
            {(component: RouterOutputs["component"]["list"][number]) => {
              return (
                <Combobox.Option value={component}>
                  {component.id}
                </Combobox.Option>
              );
            }}
          </Combobox>
        </Field.Control>
      </Field>
      {/* <Field name="job">
        <Field.Label>Select the production job or cretae another</Field.Label>
        <Field.Control>
          <Select items={jobs.data ?? []}>
            {(job) => <Select.Option value={job}>{job.id}</Select.Option>}
          </Select>
        </Field.Control>
      </Field> */}
      <Field name="quantity">
        <Field.Label>Quantity</Field.Label>
        <Field.Control>
          <Input type="number" />
        </Field.Control>
      </Field>
    </Form>
  );
}
