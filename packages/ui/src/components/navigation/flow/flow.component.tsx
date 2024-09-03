"use client";

import type { Key } from "react-aria-components";
import React, { useState } from "react";
import { faCheck, faCircle } from "@fortawesome/pro-solid-svg-icons";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";

import { cn } from "@repo/ui/lib/class-merge";

import { Icon } from "../../element";

export interface FlowProps {
  className?: string;
  children: [
    React.ReactElement<FlowStepProps>,
    ...React.ReactElement<FlowStepProps>[],
  ];
}

export interface FlowStepProps {
  id: Key;
  title: string;
  className?: string;
  children: (props: FlowStepRendererProps) => React.ReactNode;
}

export interface FlowStepRendererProps {
  nextStep: () => void;
  previousStep: () => void;
}

const Root = ({ children, className }: FlowProps) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentStep = children[currentIndex];

  const nextStep = () => {
    setCurrentIndex((prev) => {
      return Math.min(prev + 1, children.length - 1);
    });
  };

  const previousStep = () => {
    setCurrentIndex((prev) => {
      return Math.max(prev - 1, 0);
    });
  };

  return (
    <Tabs
      selectedKey={currentStep?.props.id}
      onSelectionChange={(key) =>
        setCurrentIndex(children.findIndex((s) => s.props.id === key))
      }
      className={cn(className)}
    >
      <TabList className={cn("flex flex-row border-b")}>
        {children.map((step, index) => (
          <Tab
            className="group flex flex-1 flex-col items-center space-y-2 px-6 py-4 text-center text-sm font-medium"
            key={index}
            id={step.props.id}
            isDisabled={index > currentIndex}
          >
            <span
              className={cn(
                "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                index < currentIndex && "bg-primary",
                index === currentIndex && "border-2 border-primary",
                index > currentIndex && "border-2 border-border",
              )}
            >
              {index <= currentIndex && (
                <Icon
                  icon={index === currentIndex ? faCircle : faCheck}
                  aria-hidden="true"
                  className={cn(
                    index === currentIndex
                      ? "h-3 w-3 text-primary"
                      : "h-4 w-4 text-card",
                  )}
                />
              )}
            </span>
            <span
              className={cn(
                "text-sm font-medium text-muted-foreground",
                index === currentIndex && "text-primary",
              )}
            >
              {step.props.title}
            </span>
          </Tab>
        ))}
      </TabList>
      {children.map((step, index) => (
        <TabPanel
          key={index}
          id={step.props.id.toString()}
          className={step.props.className}
        >
          {step.props.children({
            nextStep,
            previousStep,
          })}
        </TabPanel>
      ))}
    </Tabs>
  );
};

const Step = (_props: FlowStepProps) => {
  return <></>;
};

export const Flow = Object.assign(Root, {
  Step,
});

{
  /* <Tab
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
          </Tab> */
}
