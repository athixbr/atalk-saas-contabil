import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  BelongsTo,
  ForeignKey,
  HasMany
} from "sequelize-typescript";
import Company from "./Company";
import CrmTask from "./CrmTask";

@Table
class CrmTaskStage extends Model<CrmTaskStage> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @AllowNull(false)
  @Column
  name: string;

  @Default("#1976d2")
  @Column
  color: string;

  @Default(0)
  @Column
  order: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: any;

  @HasMany(() => CrmTask)
  tasks: any[];
}

export default CrmTaskStage;
