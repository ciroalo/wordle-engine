import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import GridCell from "../../src/ui/components/Grid/GridCell";

// jsdom doesn't implement scrollIntoView
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
});

describe("GridCell", () => {
  const defaultProps = {
    letter: "",
    feedback: null as "correct" | "present" | "absent" | null,
    isSeparator: false,
    isActive: false,
    isCursor: false,
    revealDelay: null as number | null,
    isWin: false,
    winDelay: null as number | null,
  };

  it("renders the letter when provided", () => {
    render(<GridCell {...defaultProps} letter="A" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders the separator character for separator cells", () => {
    render(<GridCell {...defaultProps} isSeparator={true} />);
    expect(screen.getByText("/")).toBeInTheDocument();
  });

  it("applies feedback class when revealed (no animation)", () => {
    const { container } = render(
      <GridCell {...defaultProps} letter="A" feedback="correct" />,
    );
    expect((container.firstChild as HTMLElement)?.className).toMatch(/correct/);
  });

  it("applies present class when revealed", () => {
    const { container } = render(
      <GridCell {...defaultProps} letter="B" feedback="present" />,
    );
    expect((container.firstChild as HTMLElement)?.className).toMatch(/present/);
  });

  it("applies absent class when revealed", () => {
    const { container } = render(
      <GridCell {...defaultProps} letter="C" feedback="absent" />,
    );
    expect((container.firstChild as HTMLElement)?.className).toMatch(/absent/);
  });

  it("applies revealing class during flip animation", () => {
    const { container } = render(
      <GridCell
        {...defaultProps}
        letter="A"
        feedback="correct"
        revealDelay={90}
      />,
    );
    expect((container.firstChild as HTMLElement)?.className).toMatch(
      /revealing/,
    );
    expect((container.firstChild as HTMLElement).dataset.reveal).toBe(
      "correct",
    );
  });

  it("sets --delay CSS variable during reveal", () => {
    const { container } = render(
      <GridCell
        {...defaultProps}
        letter="A"
        feedback="correct"
        revealDelay={180}
      />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue("--delay")).toBe("180ms");
  });

  it("applies active class when cursor", () => {
    const { container } = render(
      <GridCell {...defaultProps} isActive={true} isCursor={true} />,
    );
    expect((container.firstChild as HTMLElement)?.className).toMatch(/active/);
  });

  it("applies filled class when letter typed but no feedback", () => {
    const { container } = render(
      <GridCell {...defaultProps} letter="X" isActive={true} />,
    );
    expect((container.firstChild as HTMLElement)?.className).toMatch(/filled/);
  });

  it("applies win class during bounce animation", () => {
    const { container } = render(
      <GridCell
        {...defaultProps}
        letter="A"
        feedback="correct"
        isWin={true}
        winDelay={80}
      />,
    );
    expect((container.firstChild as HTMLElement)?.className).toMatch(/win/);
    expect(
      (container.firstChild as HTMLElement).style.getPropertyValue("--delay"),
    ).toBe("80ms");
  });
});
