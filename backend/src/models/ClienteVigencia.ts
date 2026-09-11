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
  AllowNull,
  Default,
  DataType,
} from "sequelize-typescript";
import Cliente from "./Cliente";
import StatusCliente from "./StatusCliente";
import StatusComplementar from "./StatusComplementar";
import PeriodicidadeCliente from "./PeriodicidadeCliente";
import TipoCliente from "./TipoCliente";
import TierCliente from "./TierCliente";
import ClusterCliente from "./ClusterCliente";
import CategoriaCliente from "./CategoriaCliente";
import SedeCliente from "./SedeCliente";
import LocalizacaoCliente from "./LocalizacaoCliente";
import Segmento from "./Segmento";
import Atuacao from "./Atuacao";
import TagsParametros from "./TagsParametros";
import AdiantamentoFolha from "./AdiantamentoFolha";
import DistribuicaoLucros from "./DistribuicaoLucros";
import PorteFederal from "./PorteFederal";
import PorteEstadual from "./PorteEstadual";
import PorteMunicipal from "./PorteMunicipal";
import RegimeTributarioFederal from "./RegimeTributarioFederal";
import RegimeTributarioEstadual from "./RegimeTributarioEstadual";
import RegimeTributarioMunicipal from "./RegimeTributarioMunicipal";
import VolumeFiscal from "./VolumeFiscal";
import VolumeContabil from "./VolumeContabil";
import VolumeDP from "./VolumeDP";
import VolumeBPO from "./VolumeBPO";
import ModalidadeFechamentoContabil from "./ModalidadeFechamentoContabil";
import ModalidadeFechamentoFiscal from "./ModalidadeFechamentoFiscal";
import ModalidadeFechamentoDP from "./ModalidadeFechamentoDP";
import ModalFechBPO from "./ModalFechBPO";

@Table({ tableName: "ClienteVigencias" })
class ClienteVigencia extends Model<ClienteVigencia> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Cliente)
  @AllowNull(false)
  @Column
  clienteId: number;

  @BelongsTo(() => Cliente)
  cliente: any;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  dataInicial: string;

  @AllowNull(true)
  @Column(DataType.DATEONLY)
  dataFinal: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  observacao: string;

  // Classificação
  @ForeignKey(() => StatusCliente)
  @Column
  statusClienteId: number;

  @BelongsTo(() => StatusCliente)
  statusCliente: any;

  @ForeignKey(() => StatusComplementar)
  @Column
  statusComplementarId: number;

  @BelongsTo(() => StatusComplementar)
  statusComplementar: any;

  @ForeignKey(() => PeriodicidadeCliente)
  @Column
  periodicidadeClienteId: number;

  @BelongsTo(() => PeriodicidadeCliente)
  periodicidadeCliente: any;

  @ForeignKey(() => TipoCliente)
  @Column
  tipoClienteId: number;

  @BelongsTo(() => TipoCliente)
  tipoClienteParametro: any;

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

  @ForeignKey(() => CategoriaCliente)
  @Column
  categoriaClienteId: number;

  @BelongsTo(() => CategoriaCliente)
  categoriaCliente: any;

  @ForeignKey(() => SedeCliente)
  @Column
  sedeClienteId: number;

  @BelongsTo(() => SedeCliente)
  sedeCliente: any;

  @ForeignKey(() => LocalizacaoCliente)
  @Column
  localizacaoClienteId: number;

  @BelongsTo(() => LocalizacaoCliente)
  localizacaoCliente: any;

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

  @ForeignKey(() => TagsParametros)
  @Column
  tagsId: number;

  @BelongsTo(() => TagsParametros)
  tags: any;

  @ForeignKey(() => AdiantamentoFolha)
  @Column
  adiantamentoFolhaId: number;

  @BelongsTo(() => AdiantamentoFolha)
  adiantamentoFolha: any;

  @ForeignKey(() => DistribuicaoLucros)
  @Column
  distribuicaoLucrosId: number;

  @BelongsTo(() => DistribuicaoLucros)
  distribuicaoLucros: any;

  // Enquadramento Tributário
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

  // Enquadramento Operacional
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

  @ForeignKey(() => ModalFechBPO)
  @Column
  modalFechBPOId: number;

  @BelongsTo(() => ModalFechBPO)
  modalFechBPO: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ClienteVigencia;
