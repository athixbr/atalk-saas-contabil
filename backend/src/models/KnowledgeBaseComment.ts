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
  HasMany
} from "sequelize-typescript";
import KnowledgeBaseArticle from "./KnowledgeBaseArticle";
import User from "./User";

@Table
class KnowledgeBaseComment extends Model<KnowledgeBaseComment> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => KnowledgeBaseArticle)
  @Column
  articleId: number;

  @BelongsTo(() => KnowledgeBaseArticle)
  article: any;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: any;

  @Column(DataType.TEXT)
  content: string;

  @ForeignKey(() => KnowledgeBaseComment)
  @Column
  parentId: number;

  @BelongsTo(() => KnowledgeBaseComment, "parentId")
  parent: any;

  @HasMany(() => KnowledgeBaseComment, "parentId")
  replies: any[];

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;
}

export default KnowledgeBaseComment;
