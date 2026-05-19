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
class UserClientesPreference extends Model<UserClientesPreference> {
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

  @Column(DataType.ARRAY(DataType.STRING))
  columnOrder: string[];

  @Default({})
  @Column(DataType.JSONB)
  columnVisibility: object;

  @Default({})
  @Column(DataType.JSONB)
  columnWidths: object;

  @Default({ key: "id", direction: "desc" })
  @Column(DataType.JSONB)
  sortConfig: object;

  @Default(true)
  @Column
  showFilters: boolean;

  @Default({})
  @Column(DataType.JSONB)
  defaultFilters: object;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default UserClientesPreference;
