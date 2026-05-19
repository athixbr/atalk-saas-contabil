import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import Contact from "./Contact";
import Ticket from "./Ticket";
import Company from "./Company";
import Queue from "./Queue";
import TicketTraking from "./TicketTraking";

@Table
class Message extends Model<Message> {
  @PrimaryKey
  @Column
  id: number;

  @Column(DataType.STRING)
  remoteJid: string;

  @Column(DataType.STRING)
  participant: string;

  @Column(DataType.STRING)
  dataJson: string;

  @Default(0)
  @Column
  ack: number;

  @Default(false)
  @Column
  read: boolean;

  @Default(false)
  @Column
  fromMe: boolean;

  @Column(DataType.TEXT)
  body: string;

  @Column(DataType.STRING)
  get mediaUrl(): string | null {
    const raw = this.getDataValue("mediaUrl");
    if (!raw) return null;
    // Arquivos novos: URL completa do DO Spaces CDN
    if (raw.startsWith("https://") || raw.startsWith("http://")) {
      // NÃO usar new URL() — ele interpreta # como fragmento e trunca o path.
      // Localiza o início do path (terceira barra) e encoda cada segmento via string.
      const doubleSlash = raw.indexOf("//");
      const pathStart = raw.indexOf("/", doubleSlash + 2);
      if (pathStart === -1) return raw;
      const origin = raw.substring(0, pathStart);
      const rawPath = raw.substring(pathStart); // ex: /company2/file[#x].pdf
      const encodedPath = rawPath
        .split("/")
        .map(seg => {
          // Decodifica primeiro para evitar duplo encoding, depois re-encoda
          try { seg = decodeURIComponent(seg); } catch (_) {}
          return encodeURIComponent(seg);
        })
        .join("/");
      return `${origin}${encodedPath}`;
    }
    // Arquivos antigos: monta URL do backend local (retrocompatível)
    return `${process.env.BACKEND_URL}${process.env.PROXY_PORT ? `:${process.env.PROXY_PORT}` : ""}/public/company${this.companyId}/${raw}`;
  }

  @Column
  mediaType: string;

  @Default(false)
  @Column
  isDeleted: boolean;

  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  @ForeignKey(() => Message)
  @Column
  quotedMsgId: string;

  @BelongsTo(() => Message, "quotedMsgId")
  quotedMsg: any;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: any;

  @ForeignKey(() => TicketTraking)
  @Column
  ticketTrakingId: number;

  @BelongsTo(() => TicketTraking, "ticketTrakingId")
  ticketTraking: any;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact, "contactId")
  contact: any; // any prevents circular __metadata TDZ

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: any;
  
  @Column
  wid: string;

  @Default(false)
  @Column
  isPrivate: boolean;

  @Default(false)
  @Column
  isEdited: boolean;

  @Default(false)
  @Column
  isForwarded: boolean;
}

export default Message;
