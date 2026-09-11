export const VARIABLE_CSS =
  ".gjs-var{background:#fff59d;border:1px dashed #f9a825;padding:0 2px;border-radius:3px;}";

const variableSpan = (key) =>
  `<span class="gjs-var" data-var="{{${key}}}" contenteditable="false">{{${key}}}</span>`;

// Blocos extras além dos já fornecidos pelo grapesjs-preset-newsletter
// (texto, imagem, botão, divisor, 1/2/3 colunas, social).
export const registerCustomBlocks = (editor) => {
  const bm = editor.BlockManager;

  bm.add("logo-empresa", {
    label: "Logo da Empresa",
    category: "Geral",
    attributes: { class: "gjs-block-logo" },
    content: {
      type: "image",
      style: {
        "max-width": "180px",
        margin: "16px auto",
        display: "block",
      },
    },
  });

  bm.add("rodape", {
    label: "Rodapé",
    category: "Geral",
    attributes: { class: "gjs-block-footer" },
    content: `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:1px solid #e0e0e0;">
        <tr>
          <td style="padding:16px;text-align:center;font-family:Arial,sans-serif;font-size:12px;color:#888888;">
            <div data-gjs-type="text">Nome da Empresa — Endereço, ${variableSpan(
              "cidade"
            )}/${variableSpan("estado")}</div>
            <div data-gjs-type="text" style="margin-top:6px;">© ${new Date().getFullYear()} Todos os direitos reservados.</div>
            <div style="margin-top:6px;">
              <a href="#" data-gjs-type="link" style="color:#888888;text-decoration:underline;">Cancelar inscrição</a>
            </div>
          </td>
        </tr>
      </table>
    `,
  });
};

export const insertVariableHtml = (key) => variableSpan(key);
