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
class KnowledgeBaseAttachment extends Model<KnowledgeBaseAttachment> {
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
  fileName: string;

  @Column(DataType.ENUM("image", "video", "document"))
  fileType: string;

  @Column
  filePath: string;

  @Column
  fileSize: number;

  @Column
  mimeType: string;

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

export default KnowledgeBaseAttachment;
