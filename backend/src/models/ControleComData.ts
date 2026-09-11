import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import Company from "./Company";

@Table({ tableName: "ControleComData" })
class ControleComData extends Model<ControleComData> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  nome: string;

  @Column
  cor: string;

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

export default ControleComData;
