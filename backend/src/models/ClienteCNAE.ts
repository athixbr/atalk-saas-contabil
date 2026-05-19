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

@Table({ tableName: "ClienteCNAEs" })
class ClienteCNAE extends Model<ClienteCNAE> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Cliente)
  @Column
  clienteId: number;

  @Column
  cnae: string;

  @Column
  descricao: string;

  @Column
  principal: boolean;

  @BelongsTo(() => Cliente)
  cliente: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ClienteCNAE;
