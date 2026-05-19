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
import GedFolder from "./GedFolder";
// import Department from "./Department"; // Comentado se não existir

@Table({ tableName: "GedShares" })
class GedShare extends Model<GedShare> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @ForeignKey(() => GedFile)
  @Column
  fileId: number;

  @BelongsTo(() => GedFile)
  file: any;

  @ForeignKey(() => GedFolder)
  @Column
  folderId: number;

  @BelongsTo(() => GedFolder)
  folder: any;

  @ForeignKey(() => User)
  @Column
  sharedBy: number;

  @BelongsTo(() => User, "sharedBy")
  sharedByUser: any;

  @Column(DataType.ENUM("user", "department", "link", "public"))
  shareType: string;

  @ForeignKey(() => User)
  @Column
  sharedWithUserId: number;

  @BelongsTo(() => User, "sharedWithUserId")
  sharedWithUser: any;

  @Column
  sharedWithDepartmentId: number;

  // @BelongsTo(() => Department)
  // sharedWithDepartment: Department;

  @Column
  shareToken: string;

  @Default("view")
  @Column(DataType.ENUM("view", "download", "edit", "full"))
  permissions: string;

  @Column
  password: string;

  @Column
  expiresAt: Date;

  @Column
  maxDownloads: number;

  @Default(0)
  @Column
  downloadCount: number;

  @Default(true)
  @Column
  isActive: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default GedShare;
