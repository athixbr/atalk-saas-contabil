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
  DataType
} from "sequelize-typescript";
import Company from "./Company";
import Whatsapp from "./Whatsapp";

@Table({ tableName: "WhatsappGroups" })
class WhatsappGroup extends Model<WhatsappGroup> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  groupId: string;

  @Column
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @Column({ defaultValue: 0 })
  participantsCount: number;

  @Column
  profilePicUrl: string;

  @Column({ defaultValue: true })
  isActive: boolean;

  @Column
  lastSyncAt: Date;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: any;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default WhatsappGroup;
