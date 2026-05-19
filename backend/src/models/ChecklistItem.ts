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
  DataType
} from "sequelize-typescript";
import Checklist from "./Checklist";

@Table({ tableName: "ChecklistItens" })
class ChecklistItem extends Model<ChecklistItem> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Checklist)
  @Column
  checklistId: number;

  @BelongsTo(() => Checklist)
  checklist: any;

  @Column
  ordem: number;

  @Column
  titulo: string;

  @Column(DataType.TEXT)
  descricao: string;

  @Column
  obrigatorio: boolean;

  @Column
  tipo: string; // 'texto', 'imagem', 'video', 'arquivo'

  @Column(DataType.TEXT)
  arquivoUrl: string;

  @Column
  arquivoNome: string;

  @Column
  arquivoPath: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ChecklistItem;
