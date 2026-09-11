import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BelongsTo,
  ForeignKey,
  HasMany,
  Default
} from "sequelize-typescript";
import Company from "./Company";
import Cliente from "./Cliente";
import User from "./User";
import NfeXmlItem from "./NfeXmlItem";

@Table({ tableName: "NfeXmls" })
class NfeXml extends Model<NfeXml> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @ForeignKey(() => Cliente)
  @Column
  clienteId: number;

  @ForeignKey(() => User)
  @Column
  uploadedBy: number;

  @Column(DataType.STRING(44))
  chaveAcesso: string;

  @Default("indeterminado")
  @Column(DataType.ENUM("entrada", "saida", "indeterminado"))
  tipoOperacao: "entrada" | "saida" | "indeterminado";

  @Default("autorizada")
  @Column(DataType.ENUM("autorizada", "cancelada", "denegada"))
  situacao: "autorizada" | "cancelada" | "denegada";

  @Column(DataType.STRING(20))
  numeroNF: string;

  @Column(DataType.STRING(10))
  serie: string;

  @Column(DataType.STRING(5))
  modelo: string;

  @Column(DataType.STRING(255))
  naturezaOperacao: string;

  @Column(DataType.DATE)
  dataEmissao: Date;

  @Column(DataType.DATE)
  dataSaidaEntrada: Date;

  @Column(DataType.STRING(20))
  emitCnpj: string;

  @Column(DataType.STRING(255))
  emitRazaoSocial: string;

  @Column(DataType.STRING(255))
  emitNomeFantasia: string;

  @Column(DataType.STRING(20))
  emitInscricaoEstadual: string;

  @Column(DataType.JSONB)
  emitEndereco: object;

  @Column(DataType.STRING(20))
  destCnpjCpf: string;

  @Column(DataType.STRING(255))
  destRazaoSocial: string;

  @Column(DataType.STRING(20))
  destInscricaoEstadual: string;

  @Column(DataType.JSONB)
  destEndereco: object;

  @Column(DataType.DECIMAL(14, 2))
  valorTotalProdutos: number;

  @Column(DataType.DECIMAL(14, 2))
  valorTotalNota: number;

  @Column(DataType.DECIMAL(14, 2))
  valorTotalDesconto: number;

  @Column(DataType.DECIMAL(14, 2))
  valorTotalFrete: number;

  @Column(DataType.DECIMAL(14, 2))
  valorTotalSeguro: number;

  @Column(DataType.DECIMAL(14, 2))
  valorTotalOutrasDespesas: number;

  @Column(DataType.DECIMAL(14, 2))
  valorBaseCalculoICMS: number;

  @Column(DataType.DECIMAL(14, 2))
  valorICMS: number;

  @Column(DataType.DECIMAL(14, 2))
  valorICMSDesonerado: number;

  @Column(DataType.DECIMAL(14, 2))
  valorTotalIPI: number;

  @Column(DataType.DECIMAL(14, 2))
  valorTotalPIS: number;

  @Column(DataType.DECIMAL(14, 2))
  valorTotalCOFINS: number;

  @Column(DataType.STRING(20))
  protocoloAutorizacao: string;

  @Column(DataType.DATE)
  dataAutorizacao: Date;

  @Column(DataType.STRING(20))
  protocoloCancelamento: string;

  @Column(DataType.DATE)
  dataCancelamento: Date;

  @Column(DataType.TEXT)
  motivoCancelamento: string;

  @Column(DataType.TEXT)
  xmlOriginalUrl: string;

  @Column(DataType.STRING(255))
  xmlOriginalNome: string;

  @Column(DataType.STRING(64))
  xmlOriginalHash: string;

  @Column(DataType.JSONB)
  rawParseWarnings: string[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: any;

  @BelongsTo(() => Cliente)
  cliente: any;

  @BelongsTo(() => User, "uploadedBy")
  uploader: any;

  @HasMany(() => NfeXmlItem, { as: "itens" })
  itens: any[];
}

export default NfeXml;
