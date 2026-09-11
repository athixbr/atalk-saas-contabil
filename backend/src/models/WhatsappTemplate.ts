import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
  DataType
} from "sequelize-typescript";
import Company from "./Company";

@Table({ tableName: "WhatsappTemplates" })
class WhatsappTemplate extends Model<WhatsappTemplate> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @AllowNull(false)
  @Column
  title: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  body: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default WhatsappTemplate;
