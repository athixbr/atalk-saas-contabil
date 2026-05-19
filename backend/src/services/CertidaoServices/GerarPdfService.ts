import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

interface DadosEcacSituacaoFiscal {
  nome?: string;
  cpf_cnpj?: string;
  normalizado_cnpj?: string;
  normalizado_cpf?: string;
  certidao_negativa?: string;
  data_emissao?: string;
  data_validade?: string;
  dados_cadastrais_pj_matriz?: {
    situacao?: string;
    data_abertura?: string;
    natureza_juridica?: string;
    porte_empresa?: string;
    endereco?: string;
    municipio?: string;
    uf?: string;
    cep?: string;
  };
  pendencias_receita_federal?: Array<{
    cnpj?: string;
    tipo?: string;
    processos?: any[];
  }>;
  pendencias_procuradoria_geral?: Array<{
    cnpj?: string;
    tipo?: string;
    inscricoes?: any[];
  }>;
  socios_e_administradores?: Array<{
    nome?: string;
    cpf_cnpj?: string;
    qualificacao?: string;
  }>;
}

export const gerarPdfEcacSituacaoFiscal = async (
  dados: DadosEcacSituacaoFiscal,
  caminhoArquivo: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Criar diretório se não existir
      const dir = path.dirname(caminhoArquivo);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Criar documento PDF
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const stream = fs.createWriteStream(caminhoArquivo);

      doc.pipe(stream);

      // Cabeçalho
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("CONSULTA eCAC - SITUAÇÃO FISCAL", { align: "center" })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .font("Helvetica")
        .text("Receita Federal do Brasil", { align: "center" })
        .moveDown(1.5);

      // Dados da Empresa
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("DADOS DA EMPRESA")
        .moveDown(0.5);

      doc.fontSize(10).font("Helvetica");

      if (dados.nome) {
        doc.text(`Nome/Razão Social: ${dados.nome}`).moveDown(0.3);
      }

      const documento = dados.normalizado_cnpj || dados.normalizado_cpf || dados.cpf_cnpj || "";
      if (documento) {
        const tipo = documento.length > 11 ? "CNPJ" : "CPF";
        doc.text(`${tipo}: ${formatarDocumento(documento)}`).moveDown(0.3);
      }

      if (dados.dados_cadastrais_pj_matriz) {
        const cadastro = dados.dados_cadastrais_pj_matriz;
        
        if (cadastro.situacao) {
          doc.text(`Situação: ${cadastro.situacao}`).moveDown(0.3);
        }
        
        if (cadastro.data_abertura) {
          doc.text(`Data de Abertura: ${cadastro.data_abertura}`).moveDown(0.3);
        }
        
        if (cadastro.natureza_juridica) {
          doc.text(`Natureza Jurídica: ${cadastro.natureza_juridica}`).moveDown(0.3);
        }
        
        if (cadastro.porte_empresa) {
          doc.text(`Porte: ${cadastro.porte_empresa}`).moveDown(0.3);
        }

        if (cadastro.endereco) {
          doc.text(`Endereço: ${cadastro.endereco}`).moveDown(0.3);
        }

        if (cadastro.municipio && cadastro.uf) {
          doc.text(`Município/UF: ${cadastro.municipio}/${cadastro.uf}`).moveDown(0.3);
        }

        if (cadastro.cep) {
          doc.text(`CEP: ${cadastro.cep}`).moveDown(0.3);
        }
      }

      doc.moveDown(1);

      // Certidão Negativa
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("CERTIDÃO NEGATIVA DE DÉBITOS")
        .moveDown(0.5);

      doc.fontSize(10).font("Helvetica");

      const temCertidaoNegativa = dados.certidao_negativa === "sim" || dados.certidao_negativa as any === true;
      
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor(temCertidaoNegativa ? "green" : "red")
        .text(temCertidaoNegativa ? "✓ POSSUI CERTIDÃO NEGATIVA" : "✗ NÃO POSSUI CERTIDÃO NEGATIVA")
        .fillColor("black")
        .moveDown(0.5);

      doc.fontSize(10).font("Helvetica");

      if (dados.data_emissao) {
        doc.text(`Data de Emissão: ${dados.data_emissao}`).moveDown(0.3);
      }

      if (dados.data_validade) {
        doc.text(`Validade: ${dados.data_validade}`).moveDown(0.3);
      }

      doc.moveDown(1);

      // Pendências Receita Federal
      if (dados.pendencias_receita_federal && dados.pendencias_receita_federal.length > 0) {
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .text("PENDÊNCIAS - RECEITA FEDERAL")
          .moveDown(0.5);

        doc.fontSize(10).font("Helvetica");

        dados.pendencias_receita_federal.forEach((pendencia, index) => {
          doc.font("Helvetica-Bold").text(`Pendência ${index + 1}:`).font("Helvetica");
          
          if (pendencia.cnpj) {
            doc.text(`  CNPJ: ${formatarDocumento(pendencia.cnpj)}`);
          }
          
          if (pendencia.tipo) {
            doc.text(`  Tipo: ${pendencia.tipo}`);
          }
          
          if (pendencia.processos && pendencia.processos.length > 0) {
            doc.text(`  Processos: ${pendencia.processos.length}`);
          }
          
          doc.moveDown(0.5);
        });
      } else {
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .text("PENDÊNCIAS - RECEITA FEDERAL")
          .moveDown(0.5);

        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("green")
          .text("✓ Nenhuma pendência encontrada")
          .fillColor("black")
          .moveDown(1);
      }

      // Pendências Procuradoria Geral
      if (dados.pendencias_procuradoria_geral && dados.pendencias_procuradoria_geral.length > 0) {
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .text("PENDÊNCIAS - PROCURADORIA GERAL DA FAZENDA NACIONAL")
          .moveDown(0.5);

        doc.fontSize(10).font("Helvetica");

        dados.pendencias_procuradoria_geral.forEach((pendencia, index) => {
          doc.font("Helvetica-Bold").text(`Pendência ${index + 1}:`).font("Helvetica");
          
          if (pendencia.cnpj) {
            doc.text(`  CNPJ: ${formatarDocumento(pendencia.cnpj)}`);
          }
          
          if (pendencia.tipo) {
            doc.text(`  Tipo: ${pendencia.tipo}`);
          }
          
          if (pendencia.inscricoes && pendencia.inscricoes.length > 0) {
            doc.text(`  Inscrições: ${pendencia.inscricoes.length}`);
          }
          
          doc.moveDown(0.5);
        });
      } else {
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .text("PENDÊNCIAS - PROCURADORIA GERAL DA FAZENDA NACIONAL")
          .moveDown(0.5);

        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("green")
          .text("✓ Nenhuma pendência encontrada")
          .fillColor("black")
          .moveDown(1);
      }

      // Sócios e Administradores
      if (dados.socios_e_administradores && dados.socios_e_administradores.length > 0) {
        doc.addPage();
        
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .text("SÓCIOS E ADMINISTRADORES")
          .moveDown(0.5);

        doc.fontSize(10).font("Helvetica");

        dados.socios_e_administradores.forEach((socio, index) => {
          doc.font("Helvetica-Bold").text(`${index + 1}. ${socio.nome || "Não informado"}`).font("Helvetica");
          
          if (socio.cpf_cnpj) {
            doc.text(`   Documento: ${formatarDocumento(socio.cpf_cnpj)}`);
          }
          
          if (socio.qualificacao) {
            doc.text(`   Qualificação: ${socio.qualificacao}`);
          }
          
          doc.moveDown(0.5);
        });
      }

      // Rodapé
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        
        doc
          .fontSize(8)
          .font("Helvetica")
          .text(
            `Documento gerado em ${new Date().toLocaleString("pt-BR")}`,
            50,
            doc.page.height - 50,
            { align: "center" }
          );

        doc.text(
          `Página ${i + 1} de ${pages.count}`,
          50,
          doc.page.height - 35,
          { align: "center" }
        );
      }

      doc.end();

      stream.on("finish", () => {
        console.log(`[GerarPdfService] PDF gerado com sucesso: ${caminhoArquivo}`);
        resolve();
      });

      stream.on("error", (error) => {
        console.error(`[GerarPdfService] Erro ao gerar PDF:`, error);
        reject(error);
      });

    } catch (error) {
      console.error(`[GerarPdfService] Erro ao criar PDF:`, error);
      reject(error);
    }
  });
};

function formatarDocumento(doc: string): string {
  const numeros = doc.replace(/\D/g, "");
  
  if (numeros.length === 11) {
    // CPF: 000.000.000-00
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else if (numeros.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  
  return doc;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')  // Remove tags HTML
    .replace(/\s+/g, ' ')       // Múltiplos espaços em um
    .trim();
}

const gerarPdfEcacCaixaPostal = (
  dadosResposta: any,
  cliente: any,
  caminhoArquivo: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const stream = fs.createWriteStream(caminhoArquivo);
      doc.pipe(stream);

      const dados = dadosResposta;

      // Cabeçalho
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .fillColor("#1e3a8a")
        .text("E-CAC - CAIXA POSTAL", { align: "center" })
        .moveDown(0.3);

      doc
        .fontSize(10)
        .fillColor("#6b7280")
        .text("Centro Virtual de Atendimento - Receita Federal", { align: "center" })
        .fillColor("black")
        .moveDown(1);

      // Linha separadora
      doc
        .strokeColor("#1e3a8a")
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke()
        .moveDown(1);

      // Dados do Cliente
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("DADOS DO CONTRIBUINTE")
        .moveDown(0.5);

      doc.fontSize(10).font("Helvetica");

      if (cliente.razaoSocial || cliente.nome) {
        doc.text(`Razão Social: ${cliente.razaoSocial || cliente.nome}`);
      }

      if (cliente.cnpj) {
        doc.text(`CNPJ: ${formatarDocumento(cliente.cnpj)}`);
      }

      doc.moveDown(1);

      // Resumo de Mensagens
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("RESUMO")
        .moveDown(0.5);

      doc.fontSize(10).font("Helvetica");
      doc.text(`Total de Mensagens Lidas: ${dados.lidas || 0}`);
      doc.text(`Total de Mensagens Não Lidas: ${dados.nao_lidas || 0}`);
      doc.moveDown(1);

      // Mensagens
      if (dados.mensagens && dados.mensagens.length > 0) {
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .text("MENSAGENS RECEBIDAS")
          .moveDown(0.5);

        dados.mensagens.forEach((msg: any, index: number) => {
          // Nova página se necessário
          if (doc.y > doc.page.height - 200) {
            doc.addPage();
          }

          // Box da mensagem
          const boxTop = doc.y;
          const boxLeft = 50;
          const boxWidth = doc.page.width - 100;
          
          doc
            .rect(boxLeft, boxTop, boxWidth, 0)
            .strokeColor(msg.lida ? "#3b82f6" : "#ef4444")
            .lineWidth(2)
            .stroke();

          doc.y = boxTop + 10;

          // Cabeçalho da mensagem
          doc
            .fontSize(11)
            .font("Helvetica-Bold")
            .fillColor(msg.lida ? "#1e40af" : "#dc2626")
            .text(`Mensagem ${index + 1}${msg.lida ? " (Lida)" : " (Não Lida)"}`, boxLeft + 10, doc.y)
            .fillColor("black");

          if (msg.relevante) {
            doc
              .fillColor("#f59e0b")
              .text(" ⚠ RELEVANTE", { continued: true })
              .fillColor("black");
          }

          doc.moveDown(0.5);

          // Dados da mensagem
          doc.fontSize(10).font("Helvetica");

          if (msg.remetente) {
            doc.font("Helvetica-Bold").text("Remetente: ", { continued: true });
            doc.font("Helvetica").text(msg.remetente);
          }

          if (msg.assunto) {
            doc.font("Helvetica-Bold").text("Assunto: ", { continued: true });
            doc.font("Helvetica").text(msg.assunto);
          }

          if (msg.envio_data) {
            doc.font("Helvetica-Bold").text("Data de Envio: ", { continued: true });
            doc.font("Helvetica").text(msg.envio_data);
          }

          if (msg.leitura_data) {
            doc.font("Helvetica-Bold").text("Data de Leitura: ", { continued: true });
            doc.font("Helvetica").text(msg.leitura_data);
          }

          if (msg.cnpj_destinatario) {
            doc.font("Helvetica-Bold").text("CNPJ Destinatário: ", { continued: true });
            doc.font("Helvetica").text(formatarDocumento(msg.cnpj_destinatario));
          }

          doc.moveDown(0.5);

          // Conteúdo da mensagem
          if (msg.conteudo_texto) {
            doc
              .fontSize(9)
              .font("Helvetica-Bold")
              .text("Conteúdo:", { underline: true })
              .moveDown(0.2);

            const conteudo = stripHtml(msg.conteudo_texto);
            const lines = doc.heightOfString(conteudo, {
              width: boxWidth - 20,
              align: "justify"
            });

            // Nova página se conteúdo muito grande
            if (doc.y + lines > doc.page.height - 100) {
              doc.addPage();
            }

            doc
              .fontSize(9)
              .font("Helvetica")
              .fillColor("#374151")
              .text(conteudo, boxLeft + 10, doc.y, {
                width: boxWidth - 20,
                align: "justify"
              })
              .fillColor("black");
          }

          doc.moveDown(1.5);
        });
      } else {
        doc
          .fontSize(12)
          .fillColor("#6b7280")
          .text("Nenhuma mensagem encontrada na caixa postal.")
          .fillColor("black");
      }

      // Rodapé em todas as páginas
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);

        doc
          .fontSize(8)
          .fillColor("#6b7280")
          .text(
            `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
            50,
            doc.page.height - 50,
            { align: "center" }
          );

        doc.text(
          `Página ${i + 1} de ${pages.count}`,
          50,
          doc.page.height - 35,
          { align: "center" }
        );
      }

      doc.end();

      stream.on("finish", () => {
        console.log(`[GerarPdfService] PDF Caixa Postal gerado: ${caminhoArquivo}`);
        resolve();
      });

      stream.on("error", (error) => {
        console.error(`[GerarPdfService] Erro ao gerar PDF:`, error);
        reject(error);
      });

    } catch (error) {
      console.error(`[GerarPdfService] Erro ao criar PDF Caixa Postal:`, error);
      reject(error);
    }
  });
};

export default {
  gerarPdfEcacSituacaoFiscal,
  gerarPdfEcacCaixaPostal
};
