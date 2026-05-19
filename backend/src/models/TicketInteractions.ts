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
  Default,
  DataType
} from "sequelize-typescript";
import Ticket from "./Ticket";
import User from "./User";
import Company from "./Company";
import Queue from "./Queue";

@Table({ tableName: "TicketInteractions" })
class TicketInteractions extends Model<TicketInteractions> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: any;

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

  @Column
  type: string;

  // TRANSFERÊNCIA
  @ForeignKey(() => User)
  @Column
  previousUserId: number;

  @BelongsTo(() => User, "previousUserId")
  previousUser: any;

  @ForeignKey(() => User)
  @Column
  newUserId: number;

  @BelongsTo(() => User, "newUserId")
  newUser: any;

  @ForeignKey(() => Queue)
  @Column
  previousQueueId: number;

  @BelongsTo(() => Queue, "previousQueueId")
  previousQueue: any;

  @ForeignKey(() => Queue)
  @Column
  newQueueId: number;

  @BelongsTo(() => Queue, "newQueueId")
  newQueue: any;

  // MENSAGEM
  @Column
  messageId: string;

  // TEMPO
  @Column
  timestamp: Date;

  @Default(0)
  @Column
  tempoDesdeUltimaInteracao: number;

  // METADADOS
  @Column(DataType.JSONB)
  metadata: object;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TicketInteractions;
