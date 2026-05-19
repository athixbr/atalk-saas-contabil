import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import Cliente from "../../models/Cliente";
import Status from "../../models/Status";
import StatusComplementar from "../../models/StatusComplementar";
import Segmento from "../../models/Segmento";
import SedeCliente from "../../models/SedeCliente";
import RegimeTributarioFederal from "../../models/RegimeTributarioFederal";
import RegimeTributarioEstadual from "../../models/RegimeTributarioEstadual";
import RegimeTributarioMunicipal from "../../models/RegimeTributarioMunicipal";
import ModalidadeFechamentoContabil from "../../models/ModalidadeFechamentoContabil";
import ModalidadeFechamentoFiscal from "../../models/ModalidadeFechamentoFiscal";
import ModalidadeFechamentoDP from "../../models/ModalidadeFechamentoDP";
import DistribuicaoLucros from "../../models/DistribuicaoLucros";
import ServicosExtraordinarios from "../../models/ServicosExtraordinarios";
import GrupoCliente from "../../models/GrupoCliente";
import LocalizacaoCliente from "../../models/LocalizacaoCliente";
import AdiantamentoFolha from "../../models/AdiantamentoFolha";
import Controles from "../../models/Controles";
import TipoCliente from "../../models/TipoCliente";
import CategoriaCliente from "../../models/CategoriaCliente";
import PeriodicidadeCliente from "../../models/PeriodicidadeCliente";
import EnvioCorrespondencia from "../../models/EnvioCorrespondencia";
import Parcelamentos from "../../models/Parcelamentos";
// import TagsParametros from "../../models/TagsParametros";
import StatusCliente from "../../models/StatusCliente";
import PorteFederal from "../../models/PorteFederal";
import PorteEstadual from "../../models/PorteEstadual";
import PorteMunicipal from "../../models/PorteMunicipal";
import TierCliente from "../../models/TierCliente";
import ClusterCliente from "../../models/ClusterCliente";
import VolumeFiscal from "../../models/VolumeFiscal";
import VolumeContabil from "../../models/VolumeContabil";
import VolumeDP from "../../models/VolumeDP";
import VolumeBPO from "../../models/VolumeBPO";
import ModalFechBPO from "../../models/ModalFechBPO";
import StatusControle from "../../models/StatusControle";

interface Request {
  companyId: number;
  searchParam?: string;
  tipoCliente?: string;
  ativo?: boolean;
  page?: number;
  limit?: number;
}

interface Response {
  clientes: Cliente[];
  count: number;
  hasMore: boolean;
}

const ListClientesService = async ({
  companyId,
  searchParam = "",
  tipoCliente,
  ativo,
  page = 1,
  limit = 10,
}: Request): Promise<Response> => {
  const whereCondition: any = {
    companyId,
  };

  if (searchParam) {
    whereCondition[Op.or] = [
      {
        nome: {
          [Op.iLike]: `%${searchParam}%`,
        },
      },
      {
        email: {
          [Op.iLike]: `%${searchParam}%`,
        },
      },
      {
        cpf: {
          [Op.iLike]: `%${searchParam}%`,
        },
      },
      {
        cnpj: {
          [Op.iLike]: `%${searchParam}%`,
        },
      },
      {
        razaoSocial: {
          [Op.iLike]: `%${searchParam}%`,
        },
      },
    ];
  }

  if (tipoCliente) {
    whereCondition.tipoCliente = tipoCliente;
  }

  if (ativo !== undefined) {
    whereCondition.ativo = ativo;
  }

  const offset = (page - 1) * limit;

  const { count, rows: clientes } = await Cliente.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Status,
        as: "status",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: StatusComplementar,
        as: "statusComplementar",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: Segmento,
        as: "segmento",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: SedeCliente,
        as: "sedeCliente",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: RegimeTributarioFederal,
        as: "regimeTributarioFederal",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: RegimeTributarioEstadual,
        as: "regimeTributarioEstadual",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: RegimeTributarioMunicipal,
        as: "regimeTributarioMunicipal",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: ModalidadeFechamentoContabil,
        as: "modalidadeFechamentoContabil",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: ModalidadeFechamentoFiscal,
        as: "modalidadeFechamentoFiscal",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: ModalidadeFechamentoDP,
        as: "modalidadeFechamentoDP",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: DistribuicaoLucros,
        as: "distribuicaoLucros",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: ServicosExtraordinarios,
        as: "servicosExtraordinarios",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: GrupoCliente,
        as: "grupoCliente",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: LocalizacaoCliente,
        as: "localizacaoCliente",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: AdiantamentoFolha,
        as: "adiantamentoFolha",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: Controles,
        as: "controles",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: TipoCliente,
        as: "tipoClienteParametro",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: CategoriaCliente,
        as: "categoriaCliente",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: PeriodicidadeCliente,
        as: "periodicidadeCliente",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: EnvioCorrespondencia,
        as: "envioCorrespondencia",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: Parcelamentos,
        as: "parcelamentos",
        attributes: ["id", "nome"],
        required: false,
      },
      // {
      //   model: TagsParametros,
      //   as: "tags",
      //   attributes: ["id", "nome"],
      //   required: false,
      // },
      {
        model: StatusCliente,
        as: "statusCliente",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: PorteFederal,
        as: "porteFederal",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: PorteEstadual,
        as: "porteEstadual",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: PorteMunicipal,
        as: "porteMunicipal",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: TierCliente,
        as: "tierCliente",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: ClusterCliente,
        as: "clusterCliente",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: VolumeFiscal,
        as: "volumeFiscal",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: VolumeContabil,
        as: "volumeContabil",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: VolumeDP,
        as: "volumeDP",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: VolumeBPO,
        as: "volumeBPO",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: ModalFechBPO,
        as: "modalFechBPO",
        attributes: ["id", "nome"],
        required: false,
      },
      {
        model: StatusControle,
        as: "statusControle",
        attributes: ["id", "nome"],
        required: false,
      },
    ],
  });

  const hasMore = count > offset + clientes.length;

  return {
    clientes,
    count,
    hasMore,
  };
};

export default ListClientesService;
