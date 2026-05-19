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

@Table({ tableName: "GedComments" })
class GedComment extends Model<GedComment> {
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

  @ForeignKey(() => GedComment)
  @Column
  parentId: number;

  @BelongsTo(() => GedComment, "parentId")
  parent: any;

  @Column(DataType.TEXT)
  comment: string;

  @Default([])
  @Column(DataType.JSON)
  mentions: number[];

  @Default(false)
  @Column
  isEdited: boolean;

  @Column
  editedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default GedComment;
