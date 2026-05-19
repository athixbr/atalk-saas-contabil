import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";

@Table({ tableName: "CampaignGruposConfig" })
class CampaignGrupoConfig extends Model<CampaignGrupoConfig> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({ defaultValue: 60 })
  syncInterval: number;

  @Column({ defaultValue: true })
  autoSync: boolean;

  @Column({ defaultValue: 50 })
  maxGroupsPerCampaign: number;

  @Column({ defaultValue: 5 })
  delayBetweenMessages: number;

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

export default CampaignGrupoConfig;
