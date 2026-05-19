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
import Cliente from "./Cliente";
import Departamento from "./Departamento";
import User from "./User";
import Company from "./Company";

@Table({ tableName: "ResponsaveisDepartamento" })
class ResponsavelDepartamento extends Model<ResponsavelDepartamento> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

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

export default ResponsavelDepartamento;
