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
  BelongsTo
} from "sequelize-typescript";
import KnowledgeBaseArticle from "./KnowledgeBaseArticle";
import KnowledgeBaseTag from "./KnowledgeBaseTag";

@Table
class KnowledgeBaseArticleTag extends Model<KnowledgeBaseArticleTag> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => KnowledgeBaseArticle)
  @Column
  articleId: number;

  @BelongsTo(() => KnowledgeBaseArticle)
  article: any;

  @ForeignKey(() => KnowledgeBaseTag)
  @Column
  tagId: number;

  @BelongsTo(() => KnowledgeBaseTag)
  tag: any;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;
}

export default KnowledgeBaseArticleTag;
