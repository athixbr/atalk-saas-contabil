import {
  Table,
  Column,
  CreatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";
import CrmLead from "./CrmLead";
import Cliente from "./Cliente";
import User from "./User";

@Table({ tableName: "CrmInteractions" })
class CrmInteraction extends Model<CrmInteraction> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @ForeignKey(() => CrmLead)
  @Column
  leadId: number;

  @ForeignKey(() => Cliente)
  @Column
  clienteId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column(DataType.STRING(50))
  type: string;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.DATE)
  date: Date;

  @Column(DataType.JSON)
  metadata: object;

  @CreatedAt
  createdAt: Date;

  @BelongsTo(() => Company)
  company: any;

  @BelongsTo(() => CrmLead)
  lead: any;

  @BelongsTo(() => Cliente)
  cliente: any;

  @BelongsTo(() => User)
  user: any;
}

export default CrmInteraction;
