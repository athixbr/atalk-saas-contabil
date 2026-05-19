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
  ForeignKey,
  HasMany
} from "sequelize-typescript";
import Company from "./Company";
import CrmTask from "./CrmTask";

@Table({ tableName: "CrmTaskCategories" })
class CrmTaskCategory extends Model<CrmTaskCategory> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column(DataType.STRING(100))
  name: string;

  @Column(DataType.STRING(50))
  type: string;

  @Column(DataType.STRING(50))
  icon: string;

  @Column(DataType.STRING(7))
  color: string;

  @Column(DataType.BOOLEAN)
  active: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: any;

  @HasMany(() => CrmTask)
  tasks: any[];
}

export default CrmTaskCategory;
