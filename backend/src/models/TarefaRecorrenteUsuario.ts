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
import User from "./User";

@Table({ tableName: "TarefasRecorrentesUsuarios" })
class TarefaRecorrenteUsuario extends Model<TarefaRecorrenteUsuario> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => TarefaRecorrente)
  @Column
  tarefaRecorrenteId: number;

  @BelongsTo(() => TarefaRecorrente)
  tarefaRecorrente: any;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  usuario: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TarefaRecorrenteUsuario;
