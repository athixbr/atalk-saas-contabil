import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  HasMany,
  Default,
  AllowNull,
  DataType,
} from "sequelize-typescript";
import Company from "./Company";
import Status from "./Status";
import StatusComplementar from "./StatusComplementar";
import Segmento from "./Segmento";
import Atuacao from "./Atuacao";
import SedeCliente from "./SedeCliente";
import RegimeTributarioFederal from "./RegimeTributarioFederal";
import RegimeTributarioEstadual from "./RegimeTributarioEstadual";
import RegimeTributarioMunicipal from "./RegimeTributarioMunicipal";
import ModalidadeFechamentoContabil from "./ModalidadeFechamentoContabil";
import ModalidadeFechamentoFiscal from "./ModalidadeFechamentoFiscal";
import ModalidadeFechamentoDP from "./ModalidadeFechamentoDP";
import DistribuicaoLucros from "./DistribuicaoLucros";
import ServicosExtraordinarios from "./ServicosExtraordinarios";
import GrupoCliente from "./GrupoCliente";
import LocalizacaoCliente from "./LocalizacaoCliente";
import AdiantamentoFolha from "./AdiantamentoFolha";
import Controles from "./Controles";
import TipoCliente from "./TipoCliente";
import CategoriaCliente from "./CategoriaCliente";
import PeriodicidadeCliente from "./PeriodicidadeCliente";
import EnvioCorrespondencia from "./EnvioCorrespondencia";
import Parcelamentos from "./Parcelamentos";
import TagsParametros from "./TagsParametros";
import StatusCliente from "./StatusCliente";
import PorteFederal from "./PorteFederal";
import PorteEstadual from "./PorteEstadual";
import PorteMunicipal from "./PorteMunicipal";
import TierCliente from "./TierCliente";
import ClusterCliente from "./ClusterCliente";
import VolumeFiscal from "./VolumeFiscal";
import VolumeContabil from "./VolumeContabil";
import VolumeDP from "./VolumeDP";
import VolumeBPO from "./VolumeBPO";
import ModalFechBPO from "./ModalFechBPO";
import StatusControle from "./StatusControle";
import Socio from "./Socio";
import ClienteSocio from "./ClienteSocio";
import DemaisIdentificadores from "./DemaisIdentificadores";
import ClienteVigencia from "./ClienteVigencia";
import DocumentoClienteAcesso from "./DocumentoClienteAcesso";
import CertificadoDigital from "./CertificadoDigital";

@Table({ tableName: "Clientes" })
class Cliente extends Model<Cliente> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @BelongsToMany(() => Socio, () => ClienteSocio)
  socios: any[];

  @HasMany(() => DocumentoClienteAcesso)
  acessosDocumentos: any[];

  @HasMany(() => CertificadoDigital)
  certificadosDigitais: any[];

  @AllowNull(false)
  @Column
  nome: string;

  @Default("recorrente")
  @Column(DataType.ENUM("interno", "recorrente", "esporadico"))
  tipoServico: "interno" | "recorrente" | "esporadico";

  @Default("recorrente")
  @Column(DataType.ENUM("recorrente", "nao_recorrente"))
  recorrencia: "recorrente" | "nao_recorrente";

  @Column
  codigoErp: string;

  @Column
  codigoSistema: string;

  @AllowNull(false)
  @Default("fisica")
  @Column(DataType.ENUM("fisica", "juridica"))
  tipoCliente: "fisica" | "juridica";

  @Column
  cpf: string;

  @Column
  cnpj: string;

  @AllowNull(false)
  @Column
  razaoSocial: string;

  @Column(DataType.TEXT)
  inscricaoEstadual: string;

  @Column
  inscricaoMunicipal: string;

  @AllowNull(false)
  @Column
  nomeFantasia: string;

  @AllowNull(false)
  @Column
  apelido: string;

  @Column(DataType.DATEONLY)
  dataAbertura: Date;

  @Column(DataType.INTEGER)
  mesAniversario: number;

  @Default(false)
  @Column
  produtorRural: boolean;

  @Column
  cep: string;

  @Column
  logradouro: string;

  @Column
  numero: string;

  @Column
  complemento: string;

  @Column
  bairro: string;

  @Column
  cidade: string;

  @Column
  estado: string;

  @Column
  telefone: string;

  @Column
  celular: string;

  @Column
  email: string;

  @Column
  site: string;

  @Column(DataType.DECIMAL(10, 2))
  honorario: number;

  @Column
  responsavel: string;

  @Column(DataType.DATEONLY)
  dataInicioContrato: Date;

  @Column(DataType.DECIMAL(10, 2))
  valorMensalidade: number;

  @Column(DataType.INTEGER)
  diaVencimento: number;

  @Column(DataType.TEXT)
  observacoes: string;

  @Default([])
  @Column(DataType.JSON)
  certidoesSelecionadas: string[];

  @Default(true)
  @Column
  ativo: boolean;

  // Relacionamentos com Parâmetros de Enquadramento
  @ForeignKey(() => Status)
  @Column
  statusId: number;

  @BelongsTo(() => Status)
  status: any;

  @ForeignKey(() => StatusComplementar)
  @Column
  statusComplementarId: number;

  @BelongsTo(() => StatusComplementar)
  statusComplementar: any;

  @ForeignKey(() => Segmento)
  @Column
  segmentoId: number;

  @BelongsTo(() => Segmento)
  segmento: any;

  @ForeignKey(() => Atuacao)
  @Column
  atuacaoId: number;

  @Default([])
  @Column(DataType.JSON)
  atuacaoIds: number[];

  @BelongsTo(() => Atuacao)
  atuacao: any;

  @ForeignKey(() => SedeCliente)
  @Column
  sedeClienteId: number;

  @BelongsTo(() => SedeCliente)
  sedeCliente: any;

  @ForeignKey(() => RegimeTributarioFederal)
  @Column
  regimeTributarioFederalId: number;

  @BelongsTo(() => RegimeTributarioFederal)
  regimeTributarioFederal: any;

  @ForeignKey(() => RegimeTributarioEstadual)
  @Column
  regimeTributarioEstadualId: number;

  @BelongsTo(() => RegimeTributarioEstadual)
  regimeTributarioEstadual: any;

  @ForeignKey(() => RegimeTributarioMunicipal)
  @Column
  regimeTributarioMunicipalId: number;

  @BelongsTo(() => RegimeTributarioMunicipal)
  regimeTributarioMunicipal: any;

  @ForeignKey(() => ModalidadeFechamentoContabil)
  @Column
  modalidadeFechamentoContabilId: number;

  @BelongsTo(() => ModalidadeFechamentoContabil)
  modalidadeFechamentoContabil: any;

  @ForeignKey(() => ModalidadeFechamentoFiscal)
  @Column
  modalidadeFechamentoFiscalId: number;

  @BelongsTo(() => ModalidadeFechamentoFiscal)
  modalidadeFechamentoFiscal: any;

  @ForeignKey(() => ModalidadeFechamentoDP)
  @Column
  modalidadeFechamentoDPId: number;

  @BelongsTo(() => ModalidadeFechamentoDP)
  modalidadeFechamentoDP: any;

  @ForeignKey(() => DistribuicaoLucros)
  @Column
  distribuicaoLucrosId: number;

  @BelongsTo(() => DistribuicaoLucros)
  distribuicaoLucros: any;

  @ForeignKey(() => ServicosExtraordinarios)
  @Column
  servicosExtraordinariosId: number;

  @BelongsTo(() => ServicosExtraordinarios)
  servicosExtraordinarios: any;

  @ForeignKey(() => GrupoCliente)
  @Column
  grupoClienteId: number;

  @BelongsTo(() => GrupoCliente)
  grupoCliente: any;

  @ForeignKey(() => LocalizacaoCliente)
  @Column
  localizacaoClienteId: number;

  @BelongsTo(() => LocalizacaoCliente)
  localizacaoCliente: any;

  @ForeignKey(() => AdiantamentoFolha)
  @Column
  adiantamentoFolhaId: number;

  @BelongsTo(() => AdiantamentoFolha)
  adiantamentoFolha: any;

  @ForeignKey(() => Controles)
  @Column
  controlesId: number;

  @BelongsTo(() => Controles)
  controles: any;

  @ForeignKey(() => TipoCliente)
  @Column
  tipoClienteId: number;

  @BelongsTo(() => TipoCliente)
  tipoClienteParametro: any;

  @ForeignKey(() => CategoriaCliente)
  @Column
  categoriaClienteId: number;

  @BelongsTo(() => CategoriaCliente)
  categoriaCliente: any;

  @ForeignKey(() => PeriodicidadeCliente)
  @Column
  periodicidadeClienteId: number;

  @BelongsTo(() => PeriodicidadeCliente)
  periodicidadeCliente: any;

  @ForeignKey(() => EnvioCorrespondencia)
  @Column
  envioCorrespondenciaId: number;

  @BelongsTo(() => EnvioCorrespondencia)
  envioCorrespondencia: any;

  @ForeignKey(() => Parcelamentos)
  @Column
  parcelamentosId: number;

  @BelongsTo(() => Parcelamentos)
  parcelamentos: any;

  @ForeignKey(() => TagsParametros)
  @Column
  tagsId: number;

  @BelongsTo(() => TagsParametros)
  tags: any;

  // Novos Parâmetros 2026
  @ForeignKey(() => StatusCliente)
  @Column
  statusClienteId: number;

  @BelongsTo(() => StatusCliente)
  statusCliente: any;

  @ForeignKey(() => PorteFederal)
  @Column
  porteFederalId: number;

  @BelongsTo(() => PorteFederal)
  porteFederal: any;

  @ForeignKey(() => PorteEstadual)
  @Column
  porteEstadualId: number;

  @BelongsTo(() => PorteEstadual)
  porteEstadual: any;

  @ForeignKey(() => PorteMunicipal)
  @Column
  porteMunicipalId: number;

  @BelongsTo(() => PorteMunicipal)
  porteMunicipal: any;

  @ForeignKey(() => TierCliente)
  @Column
  tierClienteId: number;

  @BelongsTo(() => TierCliente)
  tierCliente: any;

  @ForeignKey(() => ClusterCliente)
  @Column
  clusterClienteId: number;

  @BelongsTo(() => ClusterCliente)
  clusterCliente: any;

  @ForeignKey(() => VolumeFiscal)
  @Column
  volumeFiscalId: number;

  @BelongsTo(() => VolumeFiscal)
  volumeFiscal: any;

  @ForeignKey(() => VolumeContabil)
  @Column
  volumeContabilId: number;

  @BelongsTo(() => VolumeContabil)
  volumeContabil: any;

  @ForeignKey(() => VolumeDP)
  @Column
  volumeDPId: number;

  @BelongsTo(() => VolumeDP)
  volumeDP: any;

  @ForeignKey(() => VolumeBPO)
  @Column
  volumeBPOId: number;

  @BelongsTo(() => VolumeBPO)
  volumeBPO: any;

  @ForeignKey(() => ModalFechBPO)
  @Column
  modalFechBPOId: number;

  @BelongsTo(() => ModalFechBPO)
  modalFechBPO: any;

  @ForeignKey(() => StatusControle)
  @Column
  statusControleId: number;

  @BelongsTo(() => StatusControle)
  statusControle: any;

  @HasMany(() => DemaisIdentificadores)
  demaisIdentificadores: any[];

  @HasMany(() => ClienteVigencia, { as: "vigencias" })
  vigencias: any[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Cliente;
