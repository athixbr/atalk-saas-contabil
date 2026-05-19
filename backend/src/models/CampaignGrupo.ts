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
  HasMany,
  DataType
} from "sequelize-typescript";
import Company from "./Company";
import Whatsapp from "./Whatsapp";
import CampaignGrupoGroup from "./CampaignGrupoGroup";

@Table({ tableName: "CampaignGrupos" })
class CampaignGrupo extends Model<CampaignGrupo> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column(DataType.TEXT)
  message: string;

  @Column
  mediaPath: string;

  @Column
  mediaName: string;

  @Column({
    type: DataType.ENUM("pending", "processing", "canceled", "finished"),
    defaultValue: "pending"
  })
  status: string;

  @Column
  scheduledAt: Date;

  @Column
  startedAt: Date;

  @Column
  finishedAt: Date;

  @Column({ defaultValue: 0 })
  groupsCount: number;

  @Column({ defaultValue: 0 })
  sentCount: number;

  @Column({ defaultValue: 0 })
  failedCount: number;

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

  @HasMany(() => CampaignGrupoGroup)
  groups: any[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CampaignGrupo;
