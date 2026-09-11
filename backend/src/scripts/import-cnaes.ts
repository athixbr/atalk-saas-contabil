import "../bootstrap";
import "../database";
import axios from "axios";
import Cnae from "../models/Cnae";

const IBGE_SUBCLASSES_URL =
  "https://servicodados.ibge.gov.br/api/v2/cnae/subclasses";

interface IbgeSubclasse {
  id: string;
  descricao: string;
  classe: {
    id: string;
    descricao: string;
    grupo: {
      id: string;
      descricao: string;
      divisao: {
        id: string;
        descricao: string;
        secao: {
          id: string;
          descricao: string;
        };
      };
    };
  };
}

const formatarCodigo = (codigoNumerico: string): string => {
  if (codigoNumerico.length !== 7) return codigoNumerico;
  return `${codigoNumerico.slice(0, 4)}-${codigoNumerico.slice(
    4,
    5
  )}/${codigoNumerico.slice(5)}`;
};

const run = async (): Promise<void> => {
  try {
    console.log("🚀 Baixando tabela de subclasses CNAE do IBGE...\n");
    const { data } = await axios.get<IbgeSubclasse[]>(IBGE_SUBCLASSES_URL);
    console.log(`📦 ${data.length} subclasses recebidas do IBGE.`);

    let criados = 0;
    let atualizados = 0;

    // Sequelize 5 não suporta ON CONFLICT em coluna não-PK (conflictFields é
    // recurso do v6), então o upsert é feito manualmente por `codigo`.
    for (const item of data) {
      const codigoNumerico = item.id;
      const codigo = formatarCodigo(codigoNumerico);

      const attrs = {
        codigo,
        codigoNumerico,
        descricao: item.descricao,
        classe: item.classe.id,
        classeDescricao: item.classe.descricao,
        grupo: item.classe.grupo.id,
        grupoDescricao: item.classe.grupo.descricao,
        divisao: item.classe.grupo.divisao.id,
        divisaoDescricao: item.classe.grupo.divisao.descricao,
        secao: item.classe.grupo.divisao.secao.id,
        secaoDescricao: item.classe.grupo.divisao.secao.descricao,
      };

      const existente = await Cnae.findOne({ where: { codigo } });
      if (existente) {
        await existente.update(attrs);
        atualizados += 1;
      } else {
        await Cnae.create(attrs as any);
        criados += 1;
      }
    }

    console.log(
      `\n✅ Importação concluída: ${criados} criados, ${atualizados} atualizados.`
    );
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Erro ao importar CNAEs:", error);
    process.exit(1);
  }
};

run();
