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
  BelongsToMany,
  Default
} from "sequelize-typescript";
import KnowledgeBaseCategory from "./KnowledgeBaseCategory";
import User from "./User";
import Company from "./Company";
import KnowledgeBaseAttachment from "./KnowledgeBaseAttachment";
import KnowledgeBaseVideo from "./KnowledgeBaseVideo";
import KnowledgeBaseTag from "./KnowledgeBaseTag";
import KnowledgeBaseArticleTag from "./KnowledgeBaseArticleTag";
import KnowledgeBaseComment from "./KnowledgeBaseComment";
import KnowledgeBaseRating from "./KnowledgeBaseRating";

@Table
class KnowledgeBaseArticle extends Model<KnowledgeBaseArticle> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  title: string;

  @Column
  slug: string;

  @Column(DataType.TEXT)
  content: string;

  @Column(DataType.TEXT)
  summary: string;

  @ForeignKey(() => KnowledgeBaseCategory)
  @Column
  categoryId: number;

  @BelongsTo(() => KnowledgeBaseCategory)
  category: any;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: any;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @Default("draft")
  @Column(DataType.ENUM("draft", "published", "archived"))
  status: string;

  @Default(0)
  @Column
  views: number;

  @Default(false)
  @Column
  featured: boolean;

  @Column(DataType.DATE(6))
  publishedAt: Date;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  @HasMany(() => KnowledgeBaseAttachment)
  attachments: any[];

  @HasMany(() => KnowledgeBaseVideo)
  videos: any[];

  @BelongsToMany(() => KnowledgeBaseTag, () => KnowledgeBaseArticleTag)
  tags: any[];

  @HasMany(() => KnowledgeBaseComment)
  comments: any[];

  @HasMany(() => KnowledgeBaseRating)
  ratings: any[];
}

export default KnowledgeBaseArticle;
