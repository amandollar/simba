export function renderMarkdown(text: string) {
  const blocks = text.trim().split(/\n\n+/);

  return blocks.map((block, blockIndex) => {
    const lines = block.split("\n");

    if (lines.every((line) => /^[-*]\s+/.test(line.trim()))) {
      return (
        <ul
          key={blockIndex}
          className="list-disc space-y-1 pl-5 text-sm leading-relaxed"
        >
          {lines.map((line, i) => (
            <li key={i}>{formatInline(line.replace(/^[-*]\s+/, ""))}</li>
          ))}
        </ul>
      );
    }

    if (lines.every((line) => /^\d+\.\s+/.test(line.trim()))) {
      return (
        <ol
          key={blockIndex}
          className="list-decimal space-y-1 pl-5 text-sm leading-relaxed"
        >
          {lines.map((line, i) => (
            <li key={i}>{formatInline(line.replace(/^\d+\.\s+/, ""))}</li>
          ))}
        </ol>
      );
    }

    return (
      <p key={blockIndex} className="text-sm leading-relaxed">
        {formatInline(block.replace(/\n/g, " "))}
      </p>
    );
  });
}

function formatInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-medium text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
