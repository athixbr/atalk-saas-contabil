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
  Default,
  DataType,
} from "sequelize-typescript";
import Company from "./Company";
import EmailConfig from "./EmailConfig";
import EmailTemplate from "./EmailTemplate";

@Table({ tableName: "EmailLogs" })
class EmailLog extends Model<EmailLog> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @ForeignKey(() => EmailConfig)
  @Column
  emailConfigId: number;

  @BelongsTo(() => EmailConfig)
  emailConfig: any;

  @ForeignKey(() => EmailTemplate)
  @Column
  emailTemplateId: number;

  @BelongsTo(() => EmailTemplate)
  emailTemplate: any;

  @AllowNull(false)
  @Column
  toEmail: string;

  @AllowNull(false)
  @Column
  subject: string;

  @Column
  provider: string;

  @AllowNull(false)
  @Default("sent")
  @Column(DataType.ENUM("sent", "failed"))
  status: "sent" | "failed";

  @Column(DataType.TEXT)
  errorMessage: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default EmailLog;
