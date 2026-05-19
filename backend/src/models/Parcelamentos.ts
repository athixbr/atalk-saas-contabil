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
  HasMany,
  DataType,
} from "sequelize-typescript";
import Company from "./Company";
import Cliente from "./Cliente";
import TarefaConfig from "./TarefaConfig";
import Departamento from "./Departamento";
import User from "./User";

@Table({ tableName: "Parcelamentos" })
class Parcelamentos extends Model<Parcelamentos> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  nome: string;

  @Column(DataType.TEXT)
  descricao: string;

  @ForeignKey(() => Cliente)
  @Column
  clienteId: number;

  @BelongsTo(() => Cliente)
  cliente: any;

  @Column(DataType.DECIMAL(10, 2))
  valorTotal: number;

  @Column
  numeroParcelas: number;

  @Column
  dataInicio: Date;

  @Column(DataType.ENUM("mensal", "quinzenal", "semanal"))
  periodicidade: string;

  @Column
  diaVencimento: number;

  @Column(DataType.BOOLEAN)
  gerarTarefas: boolean;

  @ForeignKey(() => TarefaConfig)
  @Column
  tarefaConfigId: number;

  @BelongsTo(() => TarefaConfig)
  tarefaConfig: any;

  @ForeignKey(() => Departamento)
  @Column
  departamentoId: number;

  @BelongsTo(() => Departamento)
  departamento: any;

  @ForeignKey(() => User)
  @Column
  responsavelId: number;

  @BelongsTo(() => User)
  responsavel: any;

  @Column(DataType.ENUM("ativo", "concluido", "cancelado", "suspenso"))
  status: string;

  @Column(DataType.TEXT)
  observacoes: string;

  @Column(DataType.BOOLEAN)
  ativo: boolean;

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

export default Parcelamentos;
