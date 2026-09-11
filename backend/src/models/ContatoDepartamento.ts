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
import ClienteContato from "./ClienteContato";
import Departamento from "./Departamento";
import Company from "./Company";

@Table({ tableName: "ContatoDepartamentos" })
class ContatoDepartamento extends Model<ContatoDepartamento> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => ClienteContato)
  @Column
  clienteContatoId: number;

  @BelongsTo(() => ClienteContato)
  clienteContato: any;

  @ForeignKey(() => Departamento)
  @Column
  departamentoId: number;

  @BelongsTo(() => Departamento)
  departamento: any;

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

export default ContatoDepartamento;
