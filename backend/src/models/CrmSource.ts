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
import CrmLead from "./CrmLead";

@Table({ tableName: "CrmSources" })
class CrmSource extends Model<CrmSource> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column(DataType.STRING(100))
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.BOOLEAN)
  active: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: any;

  @HasMany(() => CrmLead)
  leads: any[];
}

export default CrmSource;
