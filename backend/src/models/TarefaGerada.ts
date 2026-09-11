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
  HasMany,
  DataType
} from "sequelize-typescript";
import Company from "./Company";
import TarefaInfoGeral from "./TarefaInfoGeral";
import TarefaRecorrente from "./TarefaRecorrente";
import Cliente from "./Cliente";
import Departamento from "./Departamento";
import User from "./User";
import TarefaGeradaHistorico from "./TarefaGeradaHistorico";
import ControleCliente from "./ControleCliente";

@Table({ tableName: "TarefasGeradas" })
class TarefaGerada extends Model<TarefaGerada> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @ForeignKey(() => TarefaRecorrente)
  @Column
  tarefaRecorrenteId: number;

  @BelongsTo(() => TarefaRecorrente)
  tarefaRecorrente: any;

  @ForeignKey(() => TarefaInfoGeral)
  @Column
  tarefaInfoId: number;

  @BelongsTo(() => TarefaInfoGeral)
  tarefaInfo: any;

  @ForeignKey(() => Cliente)
  @Column
  clienteId: number;

  @BelongsTo(() => Cliente)
  cliente: any;

  @ForeignKey(() => Departamento)
  @Column
  departamentoId: number;

  @BelongsTo(() => Departamento)
  departamento: any;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: any;

  @ForeignKey(() => ControleCliente)
  @Column
  controleClienteId: number;

  @BelongsTo(() => ControleCliente)
  controleCliente: any;

  @Column
  titulo: string;

  @Column(DataType.TEXT)
  descricao: string;

  // Valores válidos: pendente | em_andamento | concluida | cancelada | pausada
  // (STRING em vez de ENUM nativo do Postgres — ver migration
  // 20260812120003-change-tarefas-geradas-status-to-string.ts)
  @Column(DataType.STRING)
  status: string;

  @Column(DataType.DATE)
  dataInicio: Date;

  @Column(DataType.DATE)
  dataEntrega: Date;

  @Column(DataType.DATE)
  dataConclusao: Date;

  @Column
  competencia: string;

  @Column(DataType.JSONB)
  checklistCompleto: any;

  @Column(DataType.TEXT)
  observacoes: string;

  @HasMany(() => TarefaGeradaHistorico)
  historico: any[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TarefaGerada;
