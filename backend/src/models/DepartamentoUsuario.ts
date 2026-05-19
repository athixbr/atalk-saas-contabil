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
} from "sequelize-typescript";
import Departamento from "./Departamento";
import User from "./User";

@Table
class DepartamentoUsuario extends Model<DepartamentoUsuario> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Departamento)
  @Column
  departamentoId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column
  isCoordenador: boolean;

  @BelongsTo(() => Departamento)
  departamento: any;

  @BelongsTo(() => User)
  user: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default DepartamentoUsuario;
