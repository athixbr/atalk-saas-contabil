import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
  ForeignKey,
  Default,
  DataType
} from "sequelize-typescript";
import Task from "./Task";
import TemplateLeitura from "./TemplateLeitura";
import User from "./User";
import Company from "./Company";

@Table({ tableName: "TaskFiles" })
class TaskFile extends Model<TaskFile> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Task)
  @Column
  taskId: number;

  @ForeignKey(() => TemplateLeitura)
  @Column
  templateLeituraId: number;

  @Column
  filename: string;

  @Column
  originalName: string;

  @Column
  path: string; // company{id}/tasks/{taskId}/arquivo.pdf

  @Column
  size: number;

  @Column
  mimeType: string;

  @Column(DataType.TEXT)
  textoExtraido: string;

  @Column(DataType.JSONB)
  dadosExtraidos: any;

  @Default("pending")
  @Column
  status: string; // pending, processing, completed, error, review

  @Column
  dataLeitura: Date;

  @Column(DataType.TEXT)
  erro: string;

  @Column(DataType.DECIMAL(3, 2))
  confianca: number; // 0.00 a 1.00

  @ForeignKey(() => User)
  @Column
  uploadedBy: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Task)
  task: any;

  @BelongsTo(() => TemplateLeitura)
  template: any;

  @BelongsTo(() => User, "uploadedBy")
  uploader: any;

  @BelongsTo(() => Company)
  company: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TaskFile;
