import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  Default,
  HasMany,
  ForeignKey,
  BelongsTo,
  BelongsToMany
} from "sequelize-typescript";
import ContactCustomField from "./ContactCustomField";
import Ticket from "./Ticket";
import Company from "./Company";
import Schedule from "./Schedule";
import ContactTag from "./ContactTag";
import Tag from "./Tag";
import { buildProxyUrl } from "../config/storage";

@Table
class Contact extends Model<Contact> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @AllowNull(false)
  @Unique
  @Column
  number: string;

  @AllowNull(false)
  @Default("")
  @Column
  email: string;

  @Default("")
  @Column
  profilePicUrl: string;

  @Default(false)
  @Column
  isGroup: boolean;

  @Default(false)
  @Column
  disableBot: boolean;

  @Default(true)
  @Column
  acceptAudioMessage: boolean;

  @Default(true)
  @Column
  active: boolean;

  @Default("whatsapp")
  @Column
  channel: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Ticket)
  tickets: any[];

  @HasMany(() => ContactCustomField)
  extraInfo: any[];

  @HasMany(() => ContactTag)
  contactTags: any[];

  @BelongsToMany(() => Tag, () => ContactTag)
  tags: any[];

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @HasMany(() => Schedule, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  schedules: any[];

  @Column
  remoteJid: string;

  @Column
  lgpdAcceptedAt: Date;

  @Column
  pictureUpdated: boolean;

  @Column
  get urlPicture(): string | null {
    const filename = this.getDataValue("urlPicture");
    if (!filename) return null;
    if (filename === 'nopicture.png') {
      return `${process.env.FRONTEND_URL}/nopicture.png`;
    }
    return buildProxyUrl(`company${this.companyId}/contacts/${filename}`);
  }
}

export default Contact;
