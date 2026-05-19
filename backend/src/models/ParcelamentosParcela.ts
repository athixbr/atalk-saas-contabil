import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
  ForeignKey,
  DataType,
} from "sequelize-typescript";
import Company from "./Company";
import Parcelamentos from "./Parcelamentos";
import TarefaGerada from "./TarefaGerada";

@Table({ tableName: "ParcelamentosParcelas" })
class ParcelamentosParcela extends Model<ParcelamentosParcela> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Parcelamentos)
  @Column
  parcelamentoId: number;

  @BelongsTo(() => Parcelamentos)
  parcelamento: any;

  @Column
  numeroParcela: number;

  @Column(DataType.DECIMAL(10, 2))
  valor: number;

  @Column
  dataVencimento: Date;

  @Column
  dataPagamento: Date;

  @Column(DataType.DECIMAL(10, 2))
  valorPago: number;

  @Column(DataType.ENUM("pendente", "pago", "atrasado", "cancelado"))
  status: string;

  @ForeignKey(() => TarefaGerada)
  @Column
  tarefaGeradaId: number;

  @BelongsTo(() => TarefaGerada)
  tarefaGerada: any;

  @Column(DataType.TEXT)
  observacoes: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ParcelamentosParcela;
