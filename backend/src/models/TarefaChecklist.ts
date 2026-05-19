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
import Company from "./Company";
import TarefaInfoGeral from "./TarefaInfoGeral";

@Table({ tableName: "TarefasChecklists" })
class TarefaChecklist extends Model<TarefaChecklist> {
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
  checklistId: string;

  @Column
  titulo: string;

  @Column(DataType.JSONB)
  passos: any;

  @Column(DataType.BOOLEAN)
  obrigatorio: boolean;

  @Column
  videoUrl: string;

  @Column
  imagemUrl: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TarefaChecklist;
