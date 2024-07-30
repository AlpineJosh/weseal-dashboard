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
          { name: "Primitive", value: "primitives" },
          { name: "Composite", value: "components" },
        ],
      },
    ],
    actions: [
      {
        type: "addMany",
        templateFiles: "./templates/*.hbs",
        destination: "src/{{type}}/{{ dashCase name }}/",
        stripExtensions: ["hbs"],
      },
    ],
  });
}
