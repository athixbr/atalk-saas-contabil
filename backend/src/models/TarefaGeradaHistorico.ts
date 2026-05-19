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
import TarefaGerada from "./TarefaGerada";
import User from "./User";

@Table({ tableName: "TarefasGeradasHistorico" })
class TarefaGeradaHistorico extends Model<TarefaGeradaHistorico> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @ForeignKey(() => TarefaGerada)
  @Column
  tarefaGeradaId: number;

  @BelongsTo(() => TarefaGerada)
  tarefaGerada: any;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: any;

  @Column
  acao: string;

  @Column(DataType.INTEGER)
  departamentoAnterior: number;

  @Column(DataType.INTEGER)
  departamentoNovo: number;

  @Column(DataType.INTEGER)
  usuarioAnterior: number;

  @Column(DataType.INTEGER)
  usuarioNovo: number;

  @Column(DataType.TEXT)
  observacao: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TarefaGeradaHistorico;
