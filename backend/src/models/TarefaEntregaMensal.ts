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
  DataType
} from "sequelize-typescript";
import Company from "./Company";
import TarefaInfoGeral from "./TarefaInfoGeral";

@Table({ tableName: "TarefasEntregasMensais" })
class TarefaEntregaMensal extends Model<TarefaEntregaMensal> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @ForeignKey(() => TarefaInfoGeral)
  @Column
  tarefaInfoId: number;

  @BelongsTo(() => TarefaInfoGeral)
  tarefaInfo: any;

  @Column(DataType.INTEGER)
  janeiro: number;

  @Column(DataType.INTEGER)
  fevereiro: number;

  @Column(DataType.INTEGER)
  marco: number;

  @Column(DataType.INTEGER)
  abril: number;

  @Column(DataType.INTEGER)
  maio: number;

  @Column(DataType.INTEGER)
  junho: number;

  @Column(DataType.INTEGER)
  julho: number;

  @Column(DataType.INTEGER)
  agosto: number;

  @Column(DataType.INTEGER)
  setembro: number;

  @Column(DataType.INTEGER)
  outubro: number;

  @Column(DataType.INTEGER)
  novembro: number;

  @Column(DataType.INTEGER)
  dezembro: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TarefaEntregaMensal;
