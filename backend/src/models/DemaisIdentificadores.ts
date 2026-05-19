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
  DataType,
} from "sequelize-typescript";
import Cliente from "./Cliente";
import TipoDocumento from "./TipoDocumento";
import Company from "./Company";

@Table({ tableName: "DemaisIdentificadores" })
class DemaisIdentificadores extends Model<DemaisIdentificadores> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Cliente)
  @Column
  clienteId: number;

  @BelongsTo(() => Cliente)
  cliente: any;

  @ForeignKey(() => TipoDocumento)
  @Column
  tipoDocumentoId: number;

  @BelongsTo(() => TipoDocumento)
  tipoDocumento: any;

  @Column(DataType.STRING)
  valor: string;

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

export default DemaisIdentificadores;
