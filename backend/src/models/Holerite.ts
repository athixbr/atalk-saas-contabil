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
} from "sequelize-typescript";
import User from "./User";
import Company from "./Company";

@Table({ tableName: "Holerites" })
class Holerite extends Model<Holerite> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: any;

  @Column
  mesReferencia: number;

  @Column
  anoReferencia: number;

  @Column
  arquivoPdf: string;

  @Column
  dataUpload: Date;

  @ForeignKey(() => User)
  @Column
  uploadedBy: number;

  @BelongsTo(() => User, "uploadedBy")
  uploader: any;

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

export default Holerite;
