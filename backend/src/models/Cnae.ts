import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  Unique,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";

@Table({ tableName: "Cnaes" })
class Cnae extends Model<Cnae> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Unique
  @Column
  codigo: string;

  @Column
  codigoNumerico: string;

  @Column
  descricao: string;

  @Column
  secao: string;

  @Column
  secaoDescricao: string;

  @Column
  divisao: string;

  @Column
  divisaoDescricao: string;

  @Column
  grupo: string;

  @Column
  grupoDescricao: string;

  @Column
  classe: string;

  @Column
  classeDescricao: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Cnae;
