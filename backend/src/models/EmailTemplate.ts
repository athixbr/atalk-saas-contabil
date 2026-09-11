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
  AllowNull,
  DataType,
} from "sequelize-typescript";
import Company from "./Company";

@Table({ tableName: "EmailTemplates" })
class EmailTemplate extends Model<EmailTemplate> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @AllowNull(false)
  @Column
  title: string;

  @AllowNull(false)
  @Column
  subject: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  body: string;

  @AllowNull(true)
  @Column(DataType.JSONB)
  design: object;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default EmailTemplate;
