import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement,
  HasMany
} from "sequelize-typescript";

import Company from "./Company";
import User from "./User";
import Ticket from "./Ticket";
import Whatsapp from "./Whatsapp";
import Rating from "./Files";
import Message from "./Message";
import Queue from "./Queue";
import Contact from "./Contact";
@Table({
  tableName: "TicketTraking"
})
class TicketTraking extends Model<TicketTraking> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: any;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: any;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column
  rated: boolean;

  @BelongsTo(() => User)
  user: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  startedAt: Date;

  @Column
  queuedAt: Date;

  @Column
  closedAt: Date;

  @Column
  finishedAt: Date;

  @Column
  ratingAt: Date;

  @Column
  chatbotAt: Date;

  @Column
  @ForeignKey(() => Contact)
  contactId: number;

  @BelongsTo(() => Contact)
  contact: any; // any prevents circular __metadata TDZ

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: any;

  @HasMany(() => Message)
  message: any[];

  @Column
  status: string;

  @Column
  lastMessage: string;
}

export default TicketTraking;
