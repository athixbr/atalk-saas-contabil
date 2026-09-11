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
  Default,
  AllowNull,
  DataType,
} from "sequelize-typescript";
import Cliente from "./Cliente";
import Socio from "./Socio";

@Table({ tableName: "ClienteSocio" })
class ClienteSocio extends Model<ClienteSocio> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Cliente)
  @AllowNull(false)
  @Column
  clienteId: number;

  @BelongsTo(() => Cliente)
  cliente: any;

  @ForeignKey(() => Socio)
  @AllowNull(false)
  @Column
  socioId: number;

  @BelongsTo(() => Socio)
  socio: any;

  // Dados societários
  @Column(DataType.DECIMAL(5, 2))
  percentual: number;

  @Column(DataType.STRING(100))
  cargo: string;

  @Column(DataType.DECIMAL(15, 2))
  valorQuota: number;

  @Column(DataType.INTEGER)
  quantidadeQuotas: number;

  // Timeline
  @Column(DataType.DATEONLY)
  dataEntrada: Date;

  @Column(DataType.DATEONLY)
  dataSaida: Date;

  // Poderes
  @Default(false)
  @Column
  podeAssinar: boolean;

  @Default(false)
  @Column
  poderIsolado: boolean;

  @Default(false)
  @Column
  isAdministrador: boolean;

  // Pró-labore
  @Default(false)
  @Column
  recebeProlabore: boolean;

  @Column(DataType.DECIMAL(15, 2))
  valorProlabore: number;

  // Tipo de participação
  @Column(DataType.STRING(50))
  tipoParticipacao: string;

  // Controle
  @Column(DataType.TEXT)
  observacoes: string;

  @Default(true)
  @Column
  ativo: boolean;

  // Modo usado no formulário ("basico" ou "avancado") — define quais campos
  // aparecem por padrão ao reabrir o vínculo para edição
  @Default("avancado")
  @Column(DataType.STRING(20))
  modoCadastro: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ClienteSocio;
