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
import Cliente from "./Cliente";
// import Department from "./Department"; // Comentado se não existir

@Table({ tableName: "GedFolders" })
class GedFolder extends Model<GedFolder> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @ForeignKey(() => GedFolder)
  @Column
  parentId: number;

  @BelongsTo(() => GedFolder, "parentId")
  parent: any;

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

  @Default("custom")
  @Column(DataType.ENUM("root", "department", "personal", "shared", "client", "custom"))
  type: string;

  @ForeignKey(() => Cliente)
  @Column
  clientId: number;

  @BelongsTo(() => Cliente)
  client: any;

  @Column
  departmentId: number;

  // @BelongsTo(() => Department)
  // department: Department;

  @Default({})
  @Column(DataType.JSON)
  permissions: object;

  @Default(false)
  @Column
  isPublic: boolean;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.STRING(7))
  color: string;

  @Column
  icon: string;

  @Column(DataType.TEXT)
  path: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default GedFolder;
