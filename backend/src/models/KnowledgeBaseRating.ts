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
import User from "./User";

@Table
class KnowledgeBaseRating extends Model<KnowledgeBaseRating> {
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

  @Column
  rating: number;

  @Column(DataType.TEXT)
  feedback: string;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;
}

export default KnowledgeBaseRating;
