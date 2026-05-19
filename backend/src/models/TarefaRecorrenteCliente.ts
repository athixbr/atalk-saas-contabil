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
import Cliente from "./Cliente";

@Table({ tableName: "TarefasRecorrentesClientes" })
class TarefaRecorrenteCliente extends Model<TarefaRecorrenteCliente> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => TarefaRecorrente)
  @Column
  tarefaRecorrenteId: number;

  @ForeignKey(() => Cliente)
  @Column
  clienteId: number;

  @BelongsTo(() => TarefaRecorrente)
  tarefaRecorrente: any;

  @BelongsTo(() => Cliente)
  cliente: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TarefaRecorrenteCliente;
