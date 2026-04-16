import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GridCell from "../../src/ui/components/Grid/GridCell";

describe("GridCell", () => {
  it("renders the letter when provided", () => {
    render(
      <GridCell
        letter="A"
        feedback={null}
        isSeparator={false}
        isActive={false}
      />,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders the separator character for separator cells", () => {
    render(
      <GridCell
        letter=""
        feedback={null}
        isSeparator={true}
        isActive={false}
      />,
    );
    expect(screen.getByText("/")).toBeInTheDocument();
  });

  it("applies correct feedback class for green", () => {
    const { container } = render(
      <GridCell
        letter="A"
        feedback="correct"
        isSeparator={false}
        isActive={false}
      />,
    );
    expect(container.firstChild).toHaveClass(/correct/);
  });

  it("applies present class for yellow feedback", () => {
    const { container } = render(
      <GridCell
        letter="B"
        feedback="present"
        isSeparator={false}
        isActive={false}
      />,
    );
    expect(container.firstChild).toHaveClass(/present/);
  });

  it("applies absent class for gray feedback", () => {
    const { container } = render(
      <GridCell
        letter="C"
        feedback="absent"
        isSeparator={false}
        isActive={false}
      />,
    );
    expect(container.firstChild).toHaveClass(/absent/);
  });

  it("applies active class when active and not yet filled", () => {
    const { container } = render(
      <GridCell
        letter=""
        feedback={null}
        isSeparator={false}
        isActive={true}
      />,
    );
    expect(container.firstChild).toHaveClass(/active/);
  });

  it("applies filled class when a letter is typed but no feedback yet", () => {
    const { container } = render(
      <GridCell
        letter="X"
        feedback={null}
        isSeparator={false}
        isActive={true}
      />,
    );
    expect(container.firstChild).toHaveClass(/filled/);
  });
});
