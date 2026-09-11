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
  BelongsToMany,
  HasMany,
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";
import DepartamentoUsuario from "./DepartamentoUsuario";
import ClienteContato from "./ClienteContato";
import ContatoDepartamento from "./ContatoDepartamento";

@Table
class Departamento extends Model<Departamento> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  nome: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @BelongsToMany(() => User, () => DepartamentoUsuario)
  users: any[];

  @HasMany(() => DepartamentoUsuario)
  departamentoUsuarios: any[];

  @BelongsToMany(() => ClienteContato, () => ContatoDepartamento)
  contatos: any[];

  @HasMany(() => ContatoDepartamento)
  contatoDepartamentos: any[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Departamento;
