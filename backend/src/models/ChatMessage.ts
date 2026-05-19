import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
  ForeignKey,
  DataType
} from "sequelize-typescript";
import User from "./User";
import Chat from "./Chat";

@Table({ tableName: "ChatMessages" })
class ChatMessage extends Model<ChatMessage> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Chat)
  @Column
  chatId: number;

  @ForeignKey(() => User)
  @Column
  senderId: number;

  @Column({ defaultValue: "" })
  message: string;

  @Column
  mediaType:string;

  @Column(DataType.STRING)
  get mediaPath(): string | null {
    const raw = this.getDataValue("mediaPath");
    if (!raw) return null;
    // New files: full CDN URL stored — encode each path segment to handle special chars
    if (raw.startsWith("https://") || raw.startsWith("http://")) {
      const doubleSlash = raw.indexOf("//");
      const pathStart = raw.indexOf("/", doubleSlash + 2);
      if (pathStart === -1) return raw;
      const origin = raw.substring(0, pathStart);
      const rawPath = raw.substring(pathStart);
      const encodedPath = rawPath
        .split("/")
        .map(seg => {
          try { seg = decodeURIComponent(seg); } catch (_) {}
          return encodeURIComponent(seg);
        })
        .join("/");
      return `${origin}${encodedPath}`;
    }
    // Old files: build backend local URL (retrocompatible)
    return `${process.env.BACKEND_URL}${process.env.PROXY_PORT ? `:${process.env.PROXY_PORT}` : ""}/public/chats/${raw}`;
  }

  @Column
  mediaName: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Chat)
  chat: any;

  @BelongsTo(() => User)
  sender: any;
}

export default ChatMessage;
