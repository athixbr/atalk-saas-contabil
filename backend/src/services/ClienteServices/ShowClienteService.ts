import Cliente from "../../models/Cliente";
import __cjs_sequelize from "sequelize";
import Socio from "../../models/Socio";
import ClienteSocio from "../../models/ClienteSocio";
import AppError from "../../errors/AppError";
import Status from "../../models/Status";
import StatusComplementar from "../../models/StatusComplementar";
import Segmento from "../../models/Segmento";
import Atuacao from "../../models/Atuacao";
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
// import TagsParametros from "../../models/TagsParametros"; // Temporariamente comentado até reiniciar backend
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
import GrupoServico from "../../models/GrupoServico";
import DemaisIdentificadores from "../../models/DemaisIdentificadores";
import TipoDocumento from "../../models/TipoDocumento";
import ClienteVigencia from "../../models/ClienteVigencia";

const { Op } = __cjs_sequelize;

interface Request {
  id: string | number;
  companyId: number;
}

const ShowClienteService = async ({
  id,
  companyId,
}: Request): Promise<Cliente> => {
  const cliente = await Cliente.findOne({
    where: { id, companyId },
    include: [
      {
        model: Socio,
        as: "socios",
        include: [
          {
            model: Cliente,
            as: "clienteOrigem",
            attributes: [
              "id",
              "codigoSistema",
              "codigoErp",
              "nome",
              "nomeFantasia",
              "razaoSocial",
              "apelido",
              "tipoCliente",
              "cnpj",
              "cpf",
            ],
            required: false,
          },
        ],
        through: {
          attributes: [
            "id",
            "percentual",
            "cargo",
            "valorQuota",
            "quantidadeQuotas",
            "dataEntrada",
            "dataSaida",
            "podeAssinar",
            "poderIsolado",
            "isAdministrador",
            "recebeProlabore",
            "valorProlabore",
            "tipoParticipacao",
            "observacoes",
            "ativo",
            "modoCadastro",
          ],
        },
        required: false,
      },
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
        model: Atuacao,
        as: "atuacao",
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
      // }, // Temporariamente comentado até reiniciar backend
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
      {
        model: DemaisIdentificadores,
        as: "demaisIdentificadores",
        attributes: ["id", "tipoDocumentoId", "valor"],
        include: [
          {
            model: TipoDocumento,
            as: "tipoDocumento",
            attributes: ["id", "nome"],
            required: false,
          },
        ],
        required: false,
      },
      {
        model: ClienteVigencia,
        as: "vigencias",
        attributes: ["id", "dataInicial", "dataFinal", "createdAt"],
        required: false,
        order: [["dataInicial", "DESC"]],
      },
    ],
  });

  if (!cliente) {
    throw new AppError("Cliente não encontrado", 404);
  }

  if (!cliente.codigoSistema) {
    cliente.setDataValue("codigoSistema", String(cliente.id));
  }

  const socios = (cliente as any).socios || [];
  const documentosSocios = socios
    .map((socio: any) => (socio.cpf || "").replace(/\D/g, ""))
    .filter((documento: string) => documento);

  if (documentosSocios.length > 0) {
    const clientesOrigem = await Cliente.findAll({
      where: {
        companyId,
        id: { [Op.ne]: id },
        [Op.or]: [
          { cpf: { [Op.in]: documentosSocios } },
          { cnpj: { [Op.in]: documentosSocios } },
        ],
      },
      attributes: ["id", "nome", "razaoSocial", "nomeFantasia", "apelido", "cpf", "cnpj", "codigoErp", "codigoSistema"],
    });

    const clientesPorDocumento = new Map<string, Cliente>();
    clientesOrigem.forEach((clienteOrigem: any) => {
      const cpf = clienteOrigem.cpf ? String(clienteOrigem.cpf).replace(/\D/g, "") : "";
      const cnpj = clienteOrigem.cnpj ? String(clienteOrigem.cnpj).replace(/\D/g, "") : "";
      if (cpf) clientesPorDocumento.set(cpf, clienteOrigem);
      if (cnpj) clientesPorDocumento.set(cnpj, clienteOrigem);
    });

    socios.forEach((socio: any) => {
      const documento = socio.cpf ? String(socio.cpf).replace(/\D/g, "") : "";
      const clienteOrigem = clientesPorDocumento.get(documento);
      if (!clienteOrigem) return;

      socio.setDataValue("codigoSistema", clienteOrigem.codigoSistema || String(clienteOrigem.id));
      socio.setDataValue("codigoErp", clienteOrigem.codigoErp || socio.codigoErp || null);
      socio.setDataValue("apelido", clienteOrigem.apelido || null);
      socio.setDataValue("nomeFantasia", clienteOrigem.nomeFantasia || null);
      socio.setDataValue("razaoSocial", clienteOrigem.razaoSocial || null);
      socio.setDataValue("nome", socio.nome || clienteOrigem.apelido || clienteOrigem.nomeFantasia || clienteOrigem.razaoSocial || clienteOrigem.nome);
    });
  }

  return cliente;
};

export default ShowClienteService;
