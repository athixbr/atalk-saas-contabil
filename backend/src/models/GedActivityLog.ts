import {
  Table,
  Column,
  CreatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  Default
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";

@Table({ tableName: "GedActivityLogs", timestamps: true, updatedAt: false })
class GedActivityLog extends Model<GedActivityLog> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: any;

  @Column(DataType.ENUM(
    "file",
    "folder",
    "version"
  ))
  entityType: string;

  @Column
  entityId: number;

  @Column(DataType.ENUM(
    "create", "upload", "update", "rename", "move", "copy",
    "delete", "restore", "download", "share", "unshare",
    "version_create", "version_restore", "permission_change",
    "favorite", "unfavorite", "tag_add", "tag_remove"
  ))
  action: string;

  @Default({})
  @Column(DataType.JSON)
  details: object;

  @Column
  ipAddress: string;

  @Column(DataType.TEXT)
  userAgent: string;

  @CreatedAt
  createdAt: Date;
}

export default GedActivityLog;
