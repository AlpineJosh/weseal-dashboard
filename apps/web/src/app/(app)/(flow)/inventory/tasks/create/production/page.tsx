"use client";

import { useImmer } from "use-immer";

import type { RouterInputs, RouterOutputs } from "@repo/api";
import type { FlowStepRendererProps } from "@repo/ui/components/navigation";
import { Input } from "@repo/ui/components/control";
import { Table } from "@repo/ui/components/display";
import { Button } from "@repo/ui/components/element";
import { Card } from "@repo/ui/components/layout";
import { Flow } from "@repo/ui/components/navigation";

import { api } from "~/trpc/react";

// const SearchableListbox: React.FC<any> = (props) => {
//   return <div>Placeholder</div>;
// };

export default function CreateProductionTask() {
  //   const [task, setTask] = useImmer<RouterInputs["task"]["create"]>({
  //     type: "production",
  //     assignedToId: "",
  //   });

  const [_component, setComponent] = useImmer<
    RouterOutputs["component"]["get"] | undefined
  >(undefined);

  //   const [quantity, setQuantity] = useImmer<number>(1);
  // const [subcomponents, setSubcomponents] = useImmer<
  //   RouterOutputs["component"]["subcomponents"] | undefined
  // >(undefined);

  return (
    <Card className="relative flex h-full max-h-[calc(100vh-10rem)] flex-col">
      <Flow className="relative max-h-full overflow-y-auto">
        <Flow.Step
          className="flex flex-1 flex-col overflow-y-auto"
          title="Select Component"
          id="component"
        >
          {({ nextStep }: FlowStepRendererProps) => (
            <SelectComponent
              onSelect={(component) => {
                setComponent(component);
                nextStep();
              }}
            />
            // <SearchableListbox
            //   placeholder="Search by stock code or description"
            //   onSelect={(item) => {
            //     setComponent(item);
            //     next();
            //   }}
            //   endpoint={api.component.list}
            //   query={({ query }) => ({ filter: { search: query } })}
            // >
            //   {(component) => (
            //     <SearchableListbox.Item>
            //       <div className="flex grow flex-col">
            //         <div className="font-semibold">{component.id}</div>
            //         <div className="text-sm font-medium text-muted-foreground">
            //           {component.description}
            //         </div>
            //       </div>
            //       <div className="flex flex-col">{component.totalQuantity}</div>
            //     </SearchableListbox.Item>
            //   )}
            // </SearchableListbox>
          )}
        </Flow.Step>
        <Flow.Step title="Production Job" id="production-job">
          {({ nextStep, previousStep }) => (
            <div>
              <Button onPress={previousStep}>Previous</Button>
              <Button onPress={nextStep}>Next</Button>
            </div>
          )}
        </Flow.Step>
        <Flow.Step title="Quantity" id="quantity">
          {({ nextStep, previousStep }) => (
            <div>
              <Button onPress={previousStep}>Previous</Button>
              <Button onPress={nextStep}>Next</Button>
            </div>
          )}
        </Flow.Step>
        <Flow.Step title="Locations" id="locations">
          {({ nextStep, previousStep }) => (
            <div>
              <Button onPress={previousStep}>Previous</Button>
              <Button onPress={nextStep}>Next</Button>
            </div>
          )}
        </Flow.Step>
        <Flow.Step title="Review" id="review">
          {({ previousStep }) => (
            <div>
              <Button onPress={previousStep}>Previous</Button>
              <Button onPress={previousStep}>Prev</Button>
            </div>
          )}
        </Flow.Step>
      </Flow>
      {/* <Tabs>
        <TabList className="flex flex-row border-b">
          <Tab
            className="group flex flex-1 items-center px-6 py-4 text-sm font-medium"
            id="component"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary group-hover:bg-primary/80">
              <Icon
                icon={faCheck}
                aria-hidden="true"
                className="h-6 w-6 text-background"
              />
            </span>
            <span className="ml-4 text-sm font-medium text-muted-foreground">
              Select Component
            </span>
          </Tab>
          <Tab
            className="group flex flex-1 items-center px-6 py-4 text-sm font-medium"
            id="quantity"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary">
              <span className="text-primary">2</span>
            </span>
            <span className="ml-4 text-sm font-medium text-primary">
              Quantity
            </span>
          </Tab>
          <Tab
            className="group flex flex-1 items-center px-6 py-4 text-sm font-medium"
            id="pick-locations"
          >
            <span className="border-gray-300 group-hover:border-gray-400 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2">
              <span className="text-gray-500 group-hover:text-gray-900">3</span>
            </span>
            <span className="text-gray-500 group-hover:text-gray-900 ml-4 text-sm font-medium">
              Pick Locations
            </span>
          </Tab>
        </TabList>
        <TabPanel id="component">
          <SelectComponent />
        </TabPanel>
        <TabPanel id="quantity">Quantity</TabPanel>
        <TabPanel id="pick-locations">
          <PickLocations components={component?.subcomponents} />
        </TabPanel>
      </Tabs> */}
    </Card>
  );
}

const SelectComponent = ({
  onSelect,
}: {
  onSelect: (component: RouterOutputs["component"]["get"]) => void;
}) => {
  const [query, setQuery] = useImmer("");
  const { data, isLoading } = api.component.list.useQuery({
    filter: { search: query, hasSubcomponents: true },
  });

  return (
    <>
      <div className="border-b border-border p-4">
        <h1>Select Component</h1>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by stock code or description"
        />
      </div>
      <ul className="flex-1 overflow-y-auto">
        {data ? (
          data
            .filter((component) => component.subcomponents.length > 0)
            .map((component) => (
              <li key={component.id}>
                <button
                  className="flex w-full flex-row border-b p-2 text-left"
                  type="button"
                  onClick={() => onSelect(component)}
                >
                  <div className="flex grow flex-col">
                    <div className="font-semibold">{component.id}</div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {component.description}
                    </div>
                  </div>
                  <div className="flex flex-col">{component.totalQuantity}</div>
                </button>
              </li>
            ))
        ) : (
          <div>{isLoading ? "Loading..." : "No components found"}</div>
        )}
      </ul>
    </>
  );
};

interface PickLocationsProps {
  components: {
    id: string;
    quantityRequired: number;
    locations: {
      batch: {
        id: number;
      };
      location: {
        id: number;
        name: string;
      };
      quantityFree: number;
      quantityPicked: number;
    }[];
  }[];
}

const PickLocations = ({ components }: PickLocationsProps) => {
  const data = [
    {
      id: "Test",
      quantity: 1,
      locations: [
        {
          locationName: "Test",
          batchName: "Test",
          quantityAvailable: 1,
          quantityPicked: 0,
        },
      ],
    },
  ];
  return (
    <div>
      <div className="flex flex-row">
        <div>Component</div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head></Table.Head>
              <Table.Head>Location</Table.Head>
              <Table.Head>Batch</Table.Head>
              <Table.Head>Quantity</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <input type="checkbox" />
              </Table.Cell>
              <Table.Cell>Location</Table.Cell>
              <Table.Cell>Batch</Table.Cell>
              <Table.Cell>Quantity</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};
