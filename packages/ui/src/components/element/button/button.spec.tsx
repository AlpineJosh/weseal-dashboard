import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import { Button } from ".";

describe("Button Component", () => {
  it("renders correctly with default props", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-muted text-foreground");
  });

  it("applies the correct variant class", () => {
    render(<Button variant="secondary">Click Me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toHaveClass("bg-secondary text-background");
  });

  it("applies the correct size class", () => {
    render(<Button size="lg">Click Me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toHaveClass("h-10 rounded-md px-8");
  });

  it("forwards refs correctly", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Click Me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(ref.current).toBe(button);
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onPress={handleClick}>Click Me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies additional class names", () => {
    render(<Button className="custom-class">Click Me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toHaveClass("custom-class");
  });

  it("is disabled when the disabled prop is passed", () => {
    render(<Button isDisabled>Click Me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeDisabled();
  });
});
