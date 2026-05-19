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
import KnowledgeBaseArticle from "./KnowledgeBaseArticle";

@Table
class KnowledgeBaseVideo extends Model<KnowledgeBaseVideo> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => KnowledgeBaseArticle)
  @Column
  articleId: number;

  @BelongsTo(() => KnowledgeBaseArticle)
  article: any;

  @Column
  videoUrl: string;

  @Default("youtube")
  @Column(DataType.ENUM("youtube", "vimeo", "direct"))
  videoType: string;

  @Column
  thumbnail: string;

  @Column
  title: string;

  @Default(0)
  @Column
  order: number;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;
}

export default KnowledgeBaseVideo;
