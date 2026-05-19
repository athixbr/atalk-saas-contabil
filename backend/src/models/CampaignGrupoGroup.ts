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
import CampaignGrupo from "./CampaignGrupo";

@Table({ tableName: "CampaignGruposGroups" })
class CampaignGrupoGroup extends Model<CampaignGrupoGroup> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => CampaignGrupo)
  @Column
  campaignGrupoId: number;

  @BelongsTo(() => CampaignGrupo)
  campaignGrupo: any;

  @Column
  groupId: string;

  @Column
  groupName: string;

  @Column({
    type: DataType.ENUM("pending", "sent", "failed", "skipped"),
    defaultValue: "pending"
  })
  status: string;

  @Column
  sentAt: Date;

  @Column
  messageId: string;

  @Column(DataType.TEXT)
  errorMessage: string;

  @Column({ defaultValue: 0 })
  participantsCount: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CampaignGrupoGroup;
