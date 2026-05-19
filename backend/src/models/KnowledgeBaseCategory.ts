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
  HasMany,
  Default
} from "sequelize-typescript";
import KnowledgeBaseArticle from "./KnowledgeBaseArticle";

@Table
class KnowledgeBaseCategory extends Model<KnowledgeBaseCategory> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  slug: string;

  @Column(DataType.TEXT)
  description: string;

  @ForeignKey(() => KnowledgeBaseCategory)
  @Column
  parentId: number;

  @BelongsTo(() => KnowledgeBaseCategory, "parentId")
  parent: any;

  @HasMany(() => KnowledgeBaseCategory, "parentId")
  children: any[];

  @Column
  icon: string;

  @Column
  color: string;

  @Default(0)
  @Column
  order: number;

  @Default(true)
  @Column
  isActive: boolean;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  @HasMany(() => KnowledgeBaseArticle)
  articles: any[];
}

export default KnowledgeBaseCategory;
