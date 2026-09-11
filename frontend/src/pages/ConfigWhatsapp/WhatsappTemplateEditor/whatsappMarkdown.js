import React from "react";

// Regras de formatação de texto do WhatsApp: *negrito*, _itálico_, ~tachado~, ```monoespaçado```.
const TOKEN_RE = /```([^`]+?)```|\*([^*\n]+?)\*|_([^_\n]+?)_|~([^~\n]+?)~/g;

let keySeed = 0;

const parseInline = (text) => {
  if (!text) return [];
  const nodes = [];
  let lastIndex = 0;
  let match;
  TOKEN_RE.lastIndex = 0;

  while ((match = TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const [full, mono, bold, italic, strike] = match;
    const key = `wa-tok-${keySeed++}`;
    if (mono !== undefined) {
      nodes.push(
        <code key={key} style={{ fontFamily: "monospace", background: "rgba(0,0,0,0.06)", padding: "1px 3px", borderRadius: 3 }}>
          {mono}
        </code>
      );
    } else if (bold !== undefined) {
      nodes.push(<b key={key}>{parseInline(bold)}</b>);
    } else if (italic !== undefined) {
      nodes.push(<i key={key}>{parseInline(italic)}</i>);
    } else if (strike !== undefined) {
      nodes.push(<s key={key}>{parseInline(strike)}</s>);
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
};

// Converte o texto do template (com marcações do WhatsApp e quebras de linha)
// em nós React prontos para exibição na bolha de preview.
export const renderWhatsappText = (text) => {
  const lines = (text || "").split("\n");
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {i > 0 && <br />}
      {parseInline(line)}
    </React.Fragment>
  ));
};

export const applyMockVariables = (text, variableGroups) => {
  const map = (variableGroups || []).reduce((acc, { variables }) => {
    variables.forEach(({ key, sample }) => {
      acc[key] = sample;
    });
    return acc;
  }, {});
  return Object.entries(map).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || ""),
    text || ""
  );
};

// Envolve a seleção atual do textarea com marcadores de formatação (ou insere
// o marcador vazio no cursor quando nada está selecionado).
export const wrapSelection = (value, start, end, before, after = before) => {
  const selected = value.slice(start, end);
  const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
  const selStart = start + before.length;
  const selEnd = selStart + selected.length;
  return { value: newValue, selStart, selEnd };
};

export const insertAtCursor = (value, start, end, text) => {
  const newValue = value.slice(0, start) + text + value.slice(end);
  const pos = start + text.length;
  return { value: newValue, selStart: pos, selEnd: pos };
};

export const prefixLines = (value, start, end, prefix) => {
  const before = value.slice(0, start);
  const selected = value.slice(start, end) || "";
  const after = value.slice(end);
  const lines = (selected || "").split("\n");
  const prefixed = lines.map((l) => `${prefix}${l}`).join("\n");
  const newValue = before + prefixed + after;
  return { value: newValue, selStart: start, selEnd: start + prefixed.length };
};
