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
  Default,
} from "sequelize-typescript";
import TarefaConfig from "./TarefaConfig";

@Table({ tableName: "TarefasConfigChecklist" })
class TarefaConfigChecklist extends Model<TarefaConfigChecklist> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => TarefaConfig)
  @Column
  tarefaConfigId: number;

  @Column
  text: string;

  @Default(0)
  @Column
  order: number;

  @Column
  image: string;

  @BelongsTo(() => TarefaConfig)
  tarefaConfig: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TarefaConfigChecklist;
