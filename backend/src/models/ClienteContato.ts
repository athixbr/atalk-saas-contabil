import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import Cliente from "./Cliente";

@Table({ tableName: "ClienteContatos" })
class ClienteContato extends Model<ClienteContato> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Cliente)
  @Column
  clienteId: number;

  @Column
  nome: string;

  @Column
  cargo: string;

  @Column
  email: string;

  @Column
  telefone: string;

  @Column
  celular: string;

  @Column
  observacoes: string;

  @Column
  ativo: boolean;

  @BelongsTo(() => Cliente)
  cliente: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ClienteContato;
