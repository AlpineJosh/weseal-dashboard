import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("component", {
    description: "Generate a new component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the component?",
      },
      {
        type: "list",
        name: "type",
        message: "What type of component is it?",
        choices: [
          { name: "Element", value: "element" },
          { name: "Control", value: "control" },
          { name: "Display", value: "display" },
          { name: "Form", value: "form" },
          { name: "Navigation", value: "navigation" },
          { name: "Overlay", value: "overlay" },
          { name: "Layout", value: "layout" },
          { name: "Utility", value: "utility" },
          { name: "Typography", value: "typography" },
        ],
      },
    ],
    actions: [
      {
        type: "addMany",
        templateFiles: "./templates/*.hbs",
        destination: "src/components/{{type}}/{{ dashCase name }}/",
        stripExtensions: ["hbs"],
      },
    ],
  });
}
