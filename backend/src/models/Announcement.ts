import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";

@Table
class Announcement extends Model<Announcement> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  priority: number; //1 - alta, 2 - média, 3 - baixa

  @Column
  title: string;

  @Column(DataType.TEXT)
  text: string;

  @Column
  get mediaPath(): string | null {
    if (this.getDataValue("mediaPath")) {
      return `${process.env.BACKEND_URL}${process.env.PROXY_PORT ? `:${process.env.PROXY_PORT}` : ""}/public/announcements/${this.getDataValue("mediaPath")}`;
    }
    return null;
  }

  @Column
  mediaName: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column
  status: boolean;

  @Column
  tipo: string;

  @Column(DataType.ARRAY(DataType.INTEGER))
  usuariosIds: number[];

  @Column(DataType.ARRAY(DataType.INTEGER))
  departamentosIds: number[];

  @Column(DataType.JSONB)
  dismissedByUsers: { userId: number; dismissedAt: Date }[];

  @Column(DataType.JSONB)
  readByUsers: { userId: number; readAt: Date }[];

  @Column(DataType.DATE)
  expiresAt: Date;

  @Column(DataType.DATE)
  scheduledAt: Date;

  @Column(DataType.DATE)
  notifiedAt: Date;

  @ForeignKey(() => User)
  @Column
  createdByUserId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: any;

  @BelongsTo(() => User, "createdByUserId")
  createdByUser: User;
}

export default Announcement;
