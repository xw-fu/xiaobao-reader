import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { InlineMarkdown } from "../src/components/InlineMarkdown";

describe("InlineMarkdown", () => {
  it("renders plain text", () => {
    render(<InlineMarkdown source="hello" />);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("renders **bold** as <strong>", () => {
    const { container } = render(<InlineMarkdown source="this is **bold** text" />);
    expect(container.querySelector("strong")?.textContent).toBe("bold");
  });

  it("renders *em* as <em>", () => {
    const { container } = render(<InlineMarkdown source="some *italic* word" />);
    expect(container.querySelector("em")?.textContent).toBe("italic");
  });

  it("renders [text](url) as an anchor opening in a new tab", () => {
    render(<InlineMarkdown source="see [docs](https://example.com)" />);
    const a = screen.getByRole("link", { name: "docs" });
    expect(a).toHaveAttribute("href", "https://example.com");
    expect(a).toHaveAttribute("target", "_blank");
    expect(a).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("handles a combination of bold, em, and link in one string", () => {
    const { container } = render(
      <InlineMarkdown source="**重点** 与 *提示* 与 [原文](https://example.com)" />,
    );
    expect(container.querySelector("strong")?.textContent).toBe("重点");
    expect(container.querySelector("em")?.textContent).toBe("提示");
    expect(container.querySelector("a")?.getAttribute("href")).toBe("https://example.com");
  });
});
