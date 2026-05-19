import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  BelongsToMany
} from "sequelize-typescript";
import KnowledgeBaseArticle from "./KnowledgeBaseArticle";
import KnowledgeBaseArticleTag from "./KnowledgeBaseArticleTag";

@Table
class KnowledgeBaseTag extends Model<KnowledgeBaseTag> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  slug: string;

  @Column
  color: string;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  @BelongsToMany(() => KnowledgeBaseArticle, () => KnowledgeBaseArticleTag)
  articles: any[];
}

export default KnowledgeBaseTag;
