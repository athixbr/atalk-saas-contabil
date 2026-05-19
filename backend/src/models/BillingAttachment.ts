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
import Billing from "./Billing";
import User from "./User";

@Table
class BillingAttachment extends Model<BillingAttachment> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Billing)
  @Column
  billingId: number;

  @Column(DataType.STRING)
  fileName: string;

  @Column(DataType.STRING)
  filePath: string;

  @Column(DataType.STRING(50))
  fileType: string;

  @Column(DataType.INTEGER)
  fileSize: number;

  @Column(DataType.STRING)
  description: string;

  @ForeignKey(() => User)
  @Column
  uploadedBy: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Billing)
  billing: any;

  @BelongsTo(() => User)
  uploader: any;
}

export default BillingAttachment;
