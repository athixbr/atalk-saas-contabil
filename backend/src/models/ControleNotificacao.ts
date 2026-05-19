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
  Default,
} from "sequelize-typescript";
import ControleCliente from "./ControleCliente";
import ControleConfig from "./ControleConfig";
import Cliente from "./Cliente";
import Departamento from "./Departamento";
import User from "./User";
import Company from "./Company";

@Table({ tableName: "ControleNotificacoes" })
class ControleNotificacao extends Model<ControleNotificacao> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => ControleCliente)
  @Column
  controleClienteId: number;

  @ForeignKey(() => ControleConfig)
  @Column
  controleConfigId: number;

  @ForeignKey(() => Cliente)
  @Column
  clienteId: number;

  @Column(
    DataType.ENUM(
      "vinculacao",
      "desvinculacao",
      "alteracao",
      "geracao_tarefa",
      "lembrete",
      "vencimento"
    )
  )
  tipo: string;

  @Column(DataType.STRING(255))
  titulo: string;

  @Column(DataType.TEXT)
  mensagem: string;

  @ForeignKey(() => Departamento)
  @Column
  departamentoId: number;

  @ForeignKey(() => User)
  @Column
  usuarioId: number;

  @Column(DataType.ARRAY(DataType.INTEGER))
  usuariosIds: number[];

  @Default(false)
  @Column
  lida: boolean;

  @Column(DataType.DATE)
  lidaEm: Date;

  @Column(DataType.JSONB)
  metadata: any;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => ControleCliente)
  controleCliente: any;

  @BelongsTo(() => ControleConfig)
  controleConfig: any;

  @BelongsTo(() => Cliente)
  cliente: any;

  @BelongsTo(() => Departamento)
  departamento: any;

  @BelongsTo(() => User)
  usuario: any;

  @BelongsTo(() => Company)
  company: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ControleNotificacao;
