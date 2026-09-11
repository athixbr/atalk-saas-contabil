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
  DataType
} from "sequelize-typescript";
import TarefaRecorrente from "./TarefaRecorrente";
import Cliente from "./Cliente";
import ControleComData from "./ControleComData";

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

  @Column(DataType.DATEONLY)
  vencimento: string;

  @ForeignKey(() => ControleComData)
  @Column
  controleComDataId: number;

  @BelongsTo(() => TarefaRecorrente)
  tarefaRecorrente: any;

  @BelongsTo(() => Cliente)
  cliente: any;

  @BelongsTo(() => ControleComData)
  controleComData: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TarefaRecorrenteCliente;
