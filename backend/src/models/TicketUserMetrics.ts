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
  Default
} from "sequelize-typescript";
import Ticket from "./Ticket";
import TicketMetrics from "./TicketMetrics";
import User from "./User";
import Company from "./Company";
import Queue from "./Queue";

@Table({ tableName: "TicketUserMetrics" })
class TicketUserMetrics extends Model<TicketUserMetrics> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: any;

  @ForeignKey(() => TicketMetrics)
  @Column
  ticketMetricId: number;

  @BelongsTo(() => TicketMetrics)
  ticketMetric: any;

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

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: any;

  // CONTROLE DE TEMPO
  @Column
  startedAt: Date;

  @Column
  finishedAt: Date;

  @Default(0)
  @Column
  tempoTotal: number;

  @Default(0)
  @Column
  tempoAtivo: number;

  @Default(0)
  @Column
  tempoOcioso: number;

  // AÇÕES
  @Default(0)
  @Column
  totalMensagensEnviadas: number;

  @Default(false)
  @Column
  foiTransferido: boolean;

  @Default(false)
  @Column
  recebeuTransferencia: boolean;

  @Default(false)
  @Column
  finalizouTicket: boolean;

  // QUALIDADE
  @Default(0)
  @Column
  tempoMedioResposta: number;

  @Default(0)
  @Column
  tempoAtePrimeiraResposta: number;

  // ORDEM
  @Default(1)
  @Column
  order: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TicketUserMetrics;
