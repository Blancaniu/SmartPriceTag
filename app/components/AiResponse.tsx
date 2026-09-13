import { Fragment, type ReactNode } from "react";

// Render common AI formatting as React elements, never as raw HTML.
function inline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`)/g).map((part, index) => {
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export default function AiResponse({ text }: { text: string }) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  const listItem = /^\s*(?:[-*+]\s+|\d+[.)]\s+)(.+)$/;
  const cells = (line: string) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/).map(cell => cell.trim().replace(/\\\|/g, "|"));
  const divider = (line: string) => /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line);
  const tableStart = (index: number) => Boolean(lines[index]?.includes("|") && lines[index + 1]?.includes("|") && cells(lines[index + 1]).every(cell => /^:?-{3,}:?$/.test(cell)));
  const startsBlock = (line: string, index: number) => /^(?:#{1,6}\s|```|\s*[-*+]\s|\s*\d+[.)]\s)/.test(line) || divider(line) || tableStart(index);

  for (let i = 0; i < lines.length;) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }
    if (divider(line)) {
      blocks.push(<hr key={blocks.length} />);
      i++;
      continue;
    }
    if (tableStart(i)) {
      const headers = cells(lines[i]);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim() && lines[i].includes("|")) rows.push(cells(lines[i++]));
      blocks.push(
        <div key={blocks.length} className="ai-response-table" role="region" aria-label={`${headers.join(", ")} table`} tabIndex={0}>
          <table>
            <thead><tr>{headers.map((header, index) => <th scope="col" key={index}>{inline(header)}</th>)}</tr></thead>
            <tbody>{rows.map((row, index) => <tr key={index}>{headers.map((_, column) => <td key={column}>{inline(row[column] || "—")}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
      continue;
    }
    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) code.push(lines[i++]);
      i++;
      blocks.push(<pre key={blocks.length}><code>{code.join("\n")}</code></pre>);
      continue;
    }
    if (/^#{1,6}\s/.test(line)) {
      blocks.push(<h4 key={blocks.length}>{inline(line.replace(/^#{1,6}\s+/, "").replace(/\s+#+$/, ""))}</h4>);
      i++;
      continue;
    }
    if (listItem.test(line)) {
      const ordered = /^\d+[.)]/.test(line);
      const start = ordered ? Number.parseInt(line, 10) : undefined;
      const entries: ReactNode[] = [];
      while (i < lines.length) {
        const match = lines[i].match(listItem);
        if (!match || /^\s*\d+[.)]/.test(lines[i]) !== ordered) break;
        let content = match[1];
        i++;
        while (i < lines.length && lines[i].trim() && !startsBlock(lines[i], i)) content += ` ${lines[i++].trim()}`;
        entries.push(<li key={entries.length}>{inline(content)}</li>);
        if (!lines[i]?.trim() && lines[i + 1]?.match(listItem) && /^\s*\d+[.)]/.test(lines[i + 1]) === ordered) i++;
      }
      blocks.push(ordered ? <ol key={blocks.length} start={start}>{entries}</ol> : <ul key={blocks.length}>{entries}</ul>);
      continue;
    }
    const paragraph = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i], i)) paragraph.push(lines[i++].trim());
    blocks.push(<p key={blocks.length}>{inline(paragraph.join(" "))}</p>);
  }

  return <div className="ai-response">{blocks}</div>;
}
