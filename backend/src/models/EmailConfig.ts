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
  Default,
  AllowNull,
  DataType,
} from "sequelize-typescript";
import Company from "./Company";

@Table({ tableName: "EmailConfigs" })
class EmailConfig extends Model<EmailConfig> {
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
  @Default("resend")
  @Column(DataType.ENUM("resend", "smtp", "gmail", "hotmail", "exchange"))
  provider: "resend" | "smtp" | "gmail" | "hotmail" | "exchange";

  @AllowNull(false)
  @Column
  name: string;

  @Column
  fromName: string;

  @Column
  fromEmail: string;

  @Column(DataType.TEXT)
  apiKey: string;

  @Column
  smtpHost: string;

  @Column(DataType.INTEGER)
  smtpPort: number;

  @Default(false)
  @Column
  smtpSecure: boolean;

  @Column
  smtpUser: string;

  @Column(DataType.TEXT)
  smtpPassword: string;

  @Default(true)
  @Column
  active: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default EmailConfig;
