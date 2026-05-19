import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
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
import GedFile from "./GedFile";

@Table({ tableName: "GedFileVersions" })
class GedFileVersion extends Model<GedFileVersion> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => GedFile)
  @Column
  fileId: number;

  @BelongsTo(() => GedFile)
  file: any;

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

  @Column
  versionNumber: number;

  @Column
  name: string;

  @Column(DataType.TEXT)
  path: string;

  @Column(DataType.BIGINT)
  size: number;

  @Column
  hash: string;

  @Column(DataType.TEXT)
  comment: string;

  @Default(false)
  @Column
  isCurrent: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default GedFileVersion;
