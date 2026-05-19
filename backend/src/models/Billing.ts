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
import Contact from "./Contact";
import User from "./User";
import BillingHistory from "./BillingHistory";
import BillingAttachment from "./BillingAttachment";

@Table
class Billing extends Model<Billing> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @Column(DataType.STRING)
  clientName: string;

  @Column(DataType.STRING)
  tradeName: string;

  @Column(DataType.DECIMAL(10, 2))
  accountPayable: number;

  @Column(DataType.DECIMAL(10, 2))
  accountReceivable: number;

  @Column(DataType.DECIMAL(10, 2))
  balance: number;

  @Column(DataType.DECIMAL(10, 2))
  totalAmount: number;

  @Column(DataType.DATE)
  dueDate: Date;

  @Column(DataType.DATE)
  nextContactDate: Date;

  @Column(DataType.STRING)
  contractNumber: string;

  @Column(DataType.STRING(50))
  paymentMethod: string;

  @Column(DataType.STRING(50))
  status: string;

  @Column(DataType.TEXT)
  notes: string;

  @ForeignKey(() => User)
  @Column
  createdBy: number;

  @ForeignKey(() => User)
  @Column
  updatedBy: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: any;

  @BelongsTo(() => Contact)
  contact: any; // any prevents circular __metadata TDZ

  @BelongsTo(() => User, "createdBy")
  creator: any;

  @BelongsTo(() => User, "updatedBy")
  updater: any;

  @HasMany(() => BillingHistory)
  history: any[];

  @HasMany(() => BillingAttachment)
  attachments: any[];
}

export default Billing;
