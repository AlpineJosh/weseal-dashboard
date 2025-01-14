"use client";

import { component } from "@/models/component";
import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Heading, TextLink } from "@repo/ui/components/typography";
import { cn } from "@repo/ui/lib/class-merge";

export default function ComponentsPage() {
  return (
    <div className="flex flex-col space-y-4">
      <Heading level={1}>Stock Components</Heading>

      <DatatableQueryProvider endpoint={api.component.list} defaultInput={{}}>
        {(props) => (
          <Datatable {...props}>
            <Datatable.Head>
              <Datatable.Column id="id">ID</Datatable.Column>
              <Datatable.Column id="description" isSortable>
                Description
              </Datatable.Column>
              <Datatable.Column id="departmentName" isSortable>
                Department
              </Datatable.Column>
              <Datatable.Column id="categoryName" isSortable>
                Category
              </Datatable.Column>
              <Datatable.Column id="totalQuantity" isSortable>
                Quantity
              </Datatable.Column>
              <Datatable.Column id="allocatedQuantity" isSortable>
                Allocated
              </Datatable.Column>
              <Datatable.Column id="sageQuantity" isSortable>
                Quantity In Sage
              </Datatable.Column>
              <Datatable.Column id="sageDiscrepancy" isSortable>
                Discrepancy
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={data.id}>
                  <Datatable.Cell id="id">
                    <TextLink
                      href={`/components/${component.encodeURLId(data.id)}`}
                    >
                      {data.id}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="description">
                    {data.description}
                  </Datatable.Cell>
                  <Datatable.Cell id="departmentName">
                    {data.departmentName}
                  </Datatable.Cell>
                  <Datatable.Cell id="categoryName">
                    {data.categoryName}
                  </Datatable.Cell>
                  <Datatable.DecimalCell
                    id="totalQuantity"
                    value={data.totalQuantity}
                    unit={data.unit}
                  />
                  <Datatable.DecimalCell
                    id="allocatedQuantity"
                    value={data.allocatedQuantity}
                    unit={data.unit}
                  />
                  <Datatable.DecimalCell
                    id="sageQuantity"
                    value={data.sageQuantity}
                    unit={data.unit}
                  />
                  <Datatable.DecimalCell
                    className={cn(
                      !data.sageDiscrepancy.isZero() && "text-destructive",
                    )}
                    id="sageDiscrepancy"
                    value={data.sageDiscrepancy}
                    unit={data.unit}
                  />
                </Datatable.Row>
              )}
            </Datatable.Body>
          </Datatable>
        )}
      </DatatableQueryProvider>
    </div>
  );
}
