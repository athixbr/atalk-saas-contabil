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
import Company from "./Company";
import Contact from "./Contact";
import Ticket from "./Ticket";
import User from "./User";
import TarefaConfig from "./TarefaConfig";
import Prioridade from "./Prioridade";
import Cliente from "./Cliente";
import Departamento from "./Departamento";
import Socio from "./Socio";

@Table
class Task extends Model<Task> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column(DataType.STRING)
  title: string;

  @Column(DataType.TEXT)
  description: string;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => User)
  @Column
  createdBy: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column(DataType.STRING)
  status: string;

  @Column(DataType.DATE)
  dueDate: Date;

  @Column(DataType.DATE)
  dataHoraCriacao: Date;

  @ForeignKey(() => TarefaConfig)
  @Column
  tarefaConfigId: number;

  @ForeignKey(() => Prioridade)
  @Column
  prioridadeId: number;

  @ForeignKey(() => Cliente)
  @Column
  clienteId: number;

  @ForeignKey(() => Departamento)
  @Column
  departamentoId: number;

  @ForeignKey(() => Socio)
  @Column
  socioId: number;

  @Column(DataType.JSON)
  checklistProgresso: any;

  @Column(DataType.JSON)
  arquivos: any;

  @Column(DataType.DECIMAL(10, 2))
  valor: number;

  @Column(DataType.DATE)
  deletedAt: Date;

  @ForeignKey(() => User)
  @Column
  deletedBy: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Contact, "contactId")
  contact: any; // any prevents circular __metadata TDZ

  @BelongsTo(() => Ticket)
  ticket: any;

  @BelongsTo(() => User)
  user: any;

  @BelongsTo(() => User, "createdBy")
  creator: any;

  @BelongsTo(() => User, "deletedBy")
  deleter: any;

  @BelongsTo(() => Company)
  company: any;

  @BelongsTo(() => TarefaConfig)
  tarefaConfig: any;

  @BelongsTo(() => Prioridade)
  prioridade: any;

  @BelongsTo(() => Cliente)
  cliente: any;

  @BelongsTo(() => Departamento)
  departamento: any;

  @BelongsTo(() => Socio)
  socio: any;
}

export default Task;
