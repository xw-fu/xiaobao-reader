import { Fragment, type ReactNode } from "react";

interface Token {
  kind: "text" | "strong" | "em" | "link";
  text: string;
  href?: string;
}

// Order matters: link > strong > em (strong uses ** which contains *, so strong first).
const PATTERNS: { kind: Token["kind"]; re: RegExp }[] = [
  { kind: "link", re: /\[([^\]]+)\]\(([^)]+)\)/ },
  { kind: "strong", re: /\*\*([^*]+)\*\*/ },
  { kind: "em", re: /\*([^*]+)\*/ },
];

function tokenize(src: string): Token[] {
  if (!src) return [];
  for (const { kind, re } of PATTERNS) {
    const m = re.exec(src);
    if (!m) continue;
    const before = src.slice(0, m.index);
    const after = src.slice(m.index + m[0].length);
    const tok: Token =
      kind === "link"
        ? { kind, text: m[1], href: m[2] }
        : { kind, text: m[1] };
    return [...tokenize(before), tok, ...tokenize(after)];
  }
  return [{ kind: "text", text: src }];
}

function renderToken(tok: Token, key: number): ReactNode {
  switch (tok.kind) {
    case "text": return <Fragment key={key}>{tok.text}</Fragment>;
    case "strong": return <strong key={key}>{tok.text}</strong>;
    case "em": return <em key={key}>{tok.text}</em>;
    case "link": return (
      <a key={key} href={tok.href} target="_blank" rel="noopener noreferrer">{tok.text}</a>
    );
  }
}

export function InlineMarkdown({ source }: { source: string }) {
  const tokens = tokenize(source);
  return <>{tokens.map(renderToken)}</>;
}
