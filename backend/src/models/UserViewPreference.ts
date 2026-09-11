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
  DataType,
} from "sequelize-typescript";
import User from "./User";
import Company from "./Company";

@Table({ tableName: "UsersViewPreferences" })
class UserViewPreference extends Model<UserViewPreference> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: any;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @Column
  name: string;

  @Column
  isDefault: boolean;

  @Column(DataType.JSONB)
  columns: any;

  @Column(DataType.JSONB)
  filters: any;

  @Column(DataType.JSONB)
  sortConfig: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default UserViewPreference;
