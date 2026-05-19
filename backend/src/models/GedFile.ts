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
import GedFolder from "./GedFolder";

@Table({ tableName: "GedFiles" })
class GedFile extends Model<GedFile> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => GedFolder)
  @Column
  folderId: number;

  @BelongsTo(() => GedFolder)
  folder: any;

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
  name: string;

  @Column
  originalName: string;

  @Column(DataType.STRING(10))
  extension: string;

  @Column
  mimeType: string;

  @Column(DataType.BIGINT)
  size: number;

  @Column(DataType.TEXT)
  path: string;

  @Column(DataType.TEXT)
  url: string;

  @Column(DataType.TEXT)
  thumbnailPath: string;

  @Default(1)
  @Column
  currentVersion: number;

  @Column
  hash: string;

  @Default([])
  @Column(DataType.JSON)
  tags: string[];

  @Default({})
  @Column(DataType.JSON)
  metadata: object;

  @Default(false)
  @Column
  isFavorite: boolean;

  @Default(0)
  @Column
  downloads: number;

  @Column
  lastAccessedAt: Date;

  @Default(false)
  @Column
  isDeleted: boolean;

  @Column
  deletedAt: Date;

  @ForeignKey(() => User)
  @Column
  deletedBy: number;

  @BelongsTo(() => User, "deletedBy")
  deletedByUser: any;

  @Column
  restoreUntil: Date;

  @Column(DataType.TEXT)
  extractedText: string;

  @Column
  textExtractedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default GedFile;
