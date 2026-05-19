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

@Table({ tableName: "TarefasFinanceiro" })
class TarefaFinanceiro extends Model<TarefaFinanceiro> {
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

  @Column(DataType.DECIMAL(10, 2))
  valorServico: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TarefaFinanceiro;
