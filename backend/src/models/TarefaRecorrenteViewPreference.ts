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
import User from "./User";
import Company from "./Company";

@Table({ tableName: "TarefasRecorrentesViewPreferences" })
class TarefaRecorrenteViewPreference extends Model<TarefaRecorrenteViewPreference> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

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

  @Column
  name: string;

  @Column
  isDefault: boolean;

  @Column(DataType.JSONB)
  columns: any; // Array de objetos com configuração das colunas

  @Column(DataType.JSONB)
  filters: any; // Objeto com filtros de coluna

  @Column(DataType.JSONB)
  sortConfig: any; // Objeto com configuração de ordenação

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TarefaRecorrenteViewPreference;
