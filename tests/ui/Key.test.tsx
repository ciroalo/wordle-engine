import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Key from "../../src/ui/components/Keyboard/Key";

describe("Key", () => {
  it("renders the label", () => {
    render(<Key label="A" state="unknown" onClick={() => {}} />);
    expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Key label="B" state="unknown" onClick={handleClick} />);

    fireEvent.click(screen.getByRole("button", { name: "B" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies the correct state class for green feedback", () => {
    const { container } = render(
      <Key label="C" state="correct" onClick={() => {}} />,
    );
    const button = container.querySelector("button");

    // We check that *some* class indicating 'correct' state is applied.
    // CSS Modules hash class names, but the class name still contains 'correct'.
    expect(button?.className).toMatch(/correct/);
  });

  it("applies the wide class when isWide is true", () => {
    const { container } = render(
      <Key label="ENTER" state="unknown" isWide onClick={() => {}} />,
    );
    const button = container.querySelector("button");
    expect(button?.className).toMatch(/wide/);
  });

  it("does not apply a state class for unknown state", () => {
    const { container } = render(
      <Key label="D" state="unknown" onClick={() => {}} />,
    );
    const button = container.querySelector("button");
    expect(button?.className).not.toMatch(/correct|present|absent/);
  });
});
