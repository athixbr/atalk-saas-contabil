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
  HasMany,
  DataType
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";
import ChecklistItem from "./ChecklistItem";

@Table
class Checklist extends Model<Checklist> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @Column
  titulo: string;

  @Column(DataType.TEXT)
  descricao: string;

  @Column
  tipo: string; // 'padrao', 'com_imagem', 'com_video'

  @Column
  ativo: boolean;

  @ForeignKey(() => User)
  @Column
  createdBy: number;

  @BelongsTo(() => User, "createdBy")
  creator: any;

  @ForeignKey(() => User)
  @Column
  updatedBy: number;

  @BelongsTo(() => User, "updatedBy")
  updater: any;

  @HasMany(() => ChecklistItem)
  itens: any[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Checklist;
