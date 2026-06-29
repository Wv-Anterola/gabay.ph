import katex from "katex";
import type { ReactNode } from "react";

type Token =
  | { type: "text"; value: string }
  | { type: "math"; value: string; displayMode: boolean };

function findClosing(input: string, marker: "$" | "$$", from: number): number {
  let index = from;
  while (index < input.length) {
    const found = input.indexOf(marker, index);
    if (found === -1) return -1;
    if (found === 0 || input[found - 1] !== "\\") return found;
    index = found + marker.length;
  }
  return -1;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < input.length) {
    const displayStart = input.indexOf("$$", index);
    const inlineStart = input.indexOf("$", index);
    const nextStart =
      displayStart === -1
        ? inlineStart
        : inlineStart === -1
          ? displayStart
          : Math.min(displayStart, inlineStart);

    if (nextStart === -1) {
      tokens.push({ type: "text", value: input.slice(index) });
      break;
    }

    if (nextStart > index) {
      tokens.push({ type: "text", value: input.slice(index, nextStart) });
    }

    const displayMode = input.startsWith("$$", nextStart);
    const marker = displayMode ? "$$" : "$";
    const contentStart = nextStart + marker.length;
    const closing = findClosing(input, marker, contentStart);

    if (closing === -1) {
      tokens.push({ type: "text", value: input.slice(nextStart) });
      break;
    }

    tokens.push({
      type: "math",
      value: input.slice(contentStart, closing),
      displayMode,
    });
    index = closing + marker.length;
  }

  return tokens;
}

/** Render plain text with inline **bold** segments (math is handled separately). */
function renderInline(value: string): ReactNode[] {
  const cleaned = value.replaceAll("\\$", "$");
  return cleaned.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    return bold ? (
      <strong key={index}>{bold[1]}</strong>
    ) : (
      <span key={index}>{part}</span>
    );
  });
}

export default function MathText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <>
      {tokenize(text).map((token, index) => {
        if (token.type === "text") {
          return <span key={index}>{renderInline(token.value)}</span>;
        }

        const html = katex.renderToString(token.value, {
          displayMode: token.displayMode,
          throwOnError: false,
          strict: "ignore",
        });

        return (
          <span
            key={index}
            className={className}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </>
  );
}
