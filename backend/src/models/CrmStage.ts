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

@Table({ tableName: "CrmStages" })
class CrmStage extends Model<CrmStage> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column(DataType.STRING(100))
  name: string;

  @Column(DataType.INTEGER)
  order: number;

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
}

export default CrmStage;
