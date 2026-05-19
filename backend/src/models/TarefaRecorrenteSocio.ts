import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import TarefaRecorrente from "./TarefaRecorrente";
import Socio from "./Socio";

@Table({ tableName: "TarefasRecorrentesSocios" })
class TarefaRecorrenteSocio extends Model<TarefaRecorrenteSocio> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => TarefaRecorrente)
  @Column
  tarefaRecorrenteId: number;

  @ForeignKey(() => Socio)
  @Column
  socioId: number;

  @BelongsTo(() => TarefaRecorrente)
  tarefaRecorrente: any;

  @BelongsTo(() => Socio)
  socio: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TarefaRecorrenteSocio;
