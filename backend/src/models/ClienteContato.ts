import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  HasMany,
  HasOne,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import Cliente from "./Cliente";
import Departamento from "./Departamento";
import ContatoDepartamento from "./ContatoDepartamento";
import ContatoAppAcesso from "./ContatoAppAcesso";

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

  @BelongsToMany(() => Departamento, () => ContatoDepartamento)
  departamentos: any[];

  @HasMany(() => ContatoDepartamento)
  contatoDepartamentos: any[];

  @HasOne(() => ContatoAppAcesso)
  appAcesso: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ClienteContato;
