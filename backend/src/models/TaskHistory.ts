import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";
import Task from "./Task";
import User from "./User";

@Table({ tableName: "TaskHistory" })
class TaskHistory extends Model<TaskHistory> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Task)
  @Column
  taskId: number;

  @ForeignKey(() => User)
  @Column
  fromUserId: number;

  @ForeignKey(() => User)
  @Column
  toUserId: number;

  @Column(DataType.STRING(50))
  actionType: string;

  @Column(DataType.TEXT)
  previousValue: string;

  @Column(DataType.TEXT)
  newValue: string;

  @ForeignKey(() => User)
  @Column
  performedBy: number;

  @Column(DataType.TEXT)
  notes: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Task)
  task: any;

  @BelongsTo(() => User, "fromUserId")
  fromUser: any;

  @BelongsTo(() => User, "toUserId")
  toUser: any;

  @BelongsTo(() => User, "performedBy")
  performer: any;

  @BelongsTo(() => Company)
  company: any;
}

export default TaskHistory;
