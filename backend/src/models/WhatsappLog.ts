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
  ForeignKey,
  BelongsTo,
  DataType
} from "sequelize-typescript";
import Company from "./Company";
import Whatsapp from "./Whatsapp";
import WhatsappTemplate from "./WhatsappTemplate";

@Table({ tableName: "WhatsappLogs" })
class WhatsappLog extends Model<WhatsappLog> {
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

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: any;

  @ForeignKey(() => WhatsappTemplate)
  @Column
  whatsappTemplateId: number;

  @BelongsTo(() => WhatsappTemplate)
  whatsappTemplate: any;

  @AllowNull(false)
  @Column
  to: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  body: string;

  @AllowNull(false)
  @Default("sent")
  @Column(DataType.STRING)
  status: string;

  @Column(DataType.TEXT)
  errorMessage: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default WhatsappLog;
