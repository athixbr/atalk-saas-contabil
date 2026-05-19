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
import Billing from "./Billing";
import User from "./User";

@Table
class BillingHistory extends Model<BillingHistory> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Billing)
  @Column
  billingId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column(DataType.DATE)
  contactDate: Date;

  @Column(DataType.STRING(50))
  contactType: string;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.STRING(50))
  previousStatus: string;

  @Column(DataType.STRING(50))
  newStatus: string;

  @Column(DataType.DECIMAL(10, 2))
  amountPaid: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Billing)
  billing: any;

  @BelongsTo(() => Company)
  company: any;

  @BelongsTo(() => User)
  user: any;
}

export default BillingHistory;
