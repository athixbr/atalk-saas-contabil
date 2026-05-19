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
import Company from "./Company";
import TarefaInfoGeral from "./TarefaInfoGeral";

@Table({ tableName: "TarefasDocumentos" })
class TarefaDocumento extends Model<TarefaDocumento> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @ForeignKey(() => TarefaInfoGeral)
  @Column
  tarefaInfoId: number;

  @BelongsTo(() => TarefaInfoGeral)
  tarefaInfo: any;

  @Column
  documento: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TarefaDocumento;
