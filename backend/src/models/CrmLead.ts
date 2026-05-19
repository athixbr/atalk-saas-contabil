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
import CrmBusinessType from "./CrmBusinessType";
import CrmTaxRegime from "./CrmTaxRegime";
import CrmSource from "./CrmSource";
import CrmTask from "./CrmTask";
import CrmInteraction from "./CrmInteraction";

@Table({ tableName: "CrmLeads" })
class CrmLead extends Model<CrmLead> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column(DataType.STRING(255))
  name: string;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @Column(DataType.STRING(20))
  phone: string;

  @Column(DataType.STRING(255))
  email: string;

  @ForeignKey(() => CrmBusinessType)
  @Column
  businessTypeId: number;

  @ForeignKey(() => CrmTaxRegime)
  @Column
  taxRegimeId: number;

  @ForeignKey(() => CrmSource)
  @Column
  sourceId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column(DataType.STRING(50))
  stage: string;

  @Column(DataType.DECIMAL(10, 2))
  estimatedValue: number;

  @Column(DataType.DATE)
  lastContactDate: Date;

  @Column(DataType.TEXT)
  nextAction: string;

  @Column(DataType.DATE)
  nextActionDate: Date;

  @Column(DataType.TEXT)
  lostReason: string;

  @Column(DataType.DATE)
  closedAt: Date;

  @Column(DataType.STRING(20))
  status: string;

  @Column(DataType.TEXT)
  notes: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: any;

  @BelongsTo(() => Contact)
  contact: any; // any prevents circular __metadata TDZ

  @BelongsTo(() => User)
  user: any;

  @BelongsTo(() => CrmBusinessType)
  businessType: any;

  @BelongsTo(() => CrmTaxRegime)
  taxRegime: any;

  @BelongsTo(() => CrmSource)
  source: any;

  @HasMany(() => CrmTask)
  tasks: any[];

  @HasMany(() => CrmInteraction)
  interactions: any[];
}

export default CrmLead;
