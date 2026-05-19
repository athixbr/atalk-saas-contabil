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
import User from "./User";
import CrmBusinessType from "./CrmBusinessType";
import CrmTaxRegime from "./CrmTaxRegime";
import CrmTask from "./CrmTask";
import CrmInteraction from "./CrmInteraction";

@Table({ tableName: "CrmClients" })
class CrmClient extends Model<CrmClient> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column(DataType.STRING(255))
  name: string;

  @Column(DataType.STRING(255))
  companyName: string;

  @Column(DataType.STRING(18))
  cnpj: string;

  @Column(DataType.STRING(20))
  phone: string;

  @Column(DataType.STRING(20))
  whatsapp: string;

  @Column(DataType.STRING(255))
  email: string;

  @Column(DataType.STRING(255))
  street: string;

  @Column(DataType.STRING(20))
  number: string;

  @Column(DataType.STRING(100))
  complement: string;

  @Column(DataType.STRING(100))
  neighborhood: string;

  @Column(DataType.STRING(100))
  city: string;

  @Column(DataType.STRING(2))
  state: string;

  @Column(DataType.STRING(10))
  zipCode: string;

  @ForeignKey(() => CrmBusinessType)
  @Column
  businessTypeId: number;

  @ForeignKey(() => CrmTaxRegime)
  @Column
  taxRegimeId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

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

  @BelongsTo(() => User)
  user: any;

  @BelongsTo(() => CrmBusinessType)
  businessType: any;

  @BelongsTo(() => CrmTaxRegime)
  taxRegime: any;

  @HasMany(() => CrmTask, { foreignKey: 'crmClientId' })
  tasks: any[];

  @HasMany(() => CrmInteraction, { foreignKey: 'crmClientId' })
  interactions: any[];
}

export default CrmClient;
