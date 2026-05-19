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
  DataType,
  Default,
  AllowNull
} from "sequelize-typescript";
import Company from "./Company";
import Whatsapp from "./Whatsapp";

@Table({ tableName: "WhatsappStories" })
class WhatsappStory extends Model<WhatsappStory> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @Column
  senderJid: string;

  @AllowNull(true)
  @Column
  senderName: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  senderProfilePic: string;

  @Default("text")
  @Column
  mediaType: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  textContent: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  caption: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  mediaPath: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  mediaUrl: string;

  @AllowNull(true)
  @Column
  backgroundColor: string;

  @AllowNull(true)
  @Column
  messageId: string;

  @Column(DataType.DATE)
  expiresAt: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  seenAt: Date;

  @Default("received")
  @Column
  direction: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default WhatsappStory;
