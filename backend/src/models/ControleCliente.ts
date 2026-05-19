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
  HasMany,
  Default,
} from "sequelize-typescript";
import ControleConfig from "./ControleConfig";
import TarefaConfig from "./TarefaConfig";
import Cliente from "./Cliente";
import Departamento from "./Departamento";
import User from "./User";
import ControleClienteHistorico from "./ControleClienteHistorico";
import ControleNotificacao from "./ControleNotificacao";

@Table({ tableName: "ControleClientes" })
class ControleCliente extends Model<ControleCliente> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => ControleConfig)
  @Column
  controleConfigId: number;

  @ForeignKey(() => TarefaConfig)
  @Column
  tarefaConfigId: number;

  @ForeignKey(() => Cliente)
  @Column
  clienteId: number;

  @Column(DataType.DATEONLY)
  dataInicio: Date;

  @Column(DataType.DATEONLY)
  dataFim: Date;

  @ForeignKey(() => Departamento)
  @Column
  departamentoId: number;

  @ForeignKey(() => User)
  @Column
  usuarioId: number;

  @Default(true)
  @Column
  ativo: boolean;

  @Column(DataType.TEXT)
  observacoes: string;

  @BelongsTo(() => ControleConfig)
  controleConfig: any;

  @BelongsTo(() => TarefaConfig)
  tarefaConfig: any;

  @BelongsTo(() => Cliente)
  cliente: any;

  @BelongsTo(() => Departamento)
  departamento: any;

  @BelongsTo(() => User)
  usuario: any;

  @HasMany(() => ControleClienteHistorico)
  historico: any[];

  @HasMany(() => ControleNotificacao)
  notificacoes: any[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ControleCliente;
