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

@Table({ tableName: "ClienteRedesSociais" })
class ClienteRedeSocial extends Model<ClienteRedeSocial> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Cliente)
  @Column
  clienteId: number;

  @Column
  tipo: string; // facebook, instagram, linkedin, twitter, etc

  @Column
  url: string;

  @Column
  usuario: string;

  @BelongsTo(() => Cliente)
  cliente: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ClienteRedeSocial;
