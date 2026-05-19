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
import User from "./User";
import Company from "./Company";

@Table
class UserClientesSavedFilter extends Model<UserClientesSavedFilter> {
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
  empresaId: number;

  @BelongsTo(() => Company)
  empresa: any;

  @Column
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.JSONB)
  filters: object;

  @Default(false)
  @Column
  isDefault: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default UserClientesSavedFilter;
