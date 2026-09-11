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
  ForeignKey
} from "sequelize-typescript";
import NfeXml from "./NfeXml";
import Company from "./Company";

@Table({ tableName: "NfeXmlItens" })
class NfeXmlItem extends Model<NfeXmlItem> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => NfeXml)
  @Column
  nfeXmlId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column(DataType.INTEGER)
  numeroItem: number;

  @Column(DataType.STRING(60))
  codigoProduto: string;

  @Column(DataType.TEXT)
  descricao: string;

  @Column(DataType.STRING(10))
  ncm: string;

  @Column(DataType.STRING(10))
  cfop: string;

  @Column(DataType.STRING(10))
  unidadeComercial: string;

  @Column(DataType.DECIMAL(14, 4))
  quantidadeComercial: number;

  @Column(DataType.DECIMAL(18, 10))
  valorUnitarioComercial: number;

  @Column(DataType.DECIMAL(14, 2))
  valorTotalProduto: number;

  @Column(DataType.STRING(5))
  cst: string;

  @Column(DataType.STRING(5))
  csosn: string;

  @Column(DataType.DECIMAL(14, 2))
  valorBaseCalculoICMS: number;

  @Column(DataType.DECIMAL(6, 2))
  aliquotaICMS: number;

  @Column(DataType.DECIMAL(14, 2))
  valorICMS: number;

  @Column(DataType.STRING(5))
  cstIPI: string;

  @Column(DataType.DECIMAL(6, 2))
  aliquotaIPI: number;

  @Column(DataType.DECIMAL(14, 2))
  valorIPI: number;

  @Column(DataType.STRING(5))
  cstPIS: string;

  @Column(DataType.DECIMAL(6, 2))
  aliquotaPIS: number;

  @Column(DataType.DECIMAL(14, 2))
  valorPIS: number;

  @Column(DataType.STRING(5))
  cstCOFINS: string;

  @Column(DataType.DECIMAL(6, 2))
  aliquotaCOFINS: number;

  @Column(DataType.DECIMAL(14, 2))
  valorCOFINS: number;

  @Column(DataType.JSONB)
  impostosRaw: object;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => NfeXml)
  nfeXml: any;
}

export default NfeXmlItem;
