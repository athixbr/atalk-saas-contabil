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
  HasMany,
  Default,
  DataType
} from "sequelize-typescript";
import Ticket from "./Ticket";
import Company from "./Company";
import TicketUserMetrics from "./TicketUserMetrics";

@Table({ tableName: "TicketMetrics" })
class TicketMetrics extends Model<TicketMetrics> {
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

  // TEMPOS GERAIS
  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  firstResponseAt: Date;

  @Column
  firstInteractionAt: Date;

  @Column
  closedAt: Date;

  // TEMPOS EM SEGUNDOS
  @Default(0)
  @Column
  tempoEsperaInicial: number;

  @Default(0)
  @Column
  tempoAtePrimeiraResposta: number;

  @Default(0)
  @Column
  tempoTotalAtendimento: number;

  @Default(0)
  @Column
  tempoOcioso: number;

  @Default(0)
  @Column
  tempoAtivo: number;

  // TRANSFERÊNCIAS
  @Default(0)
  @Column
  numeroTransferencias: number;

  @Default(0)
  @Column
  numeroMudancasFila: number;

  // ESTATÍSTICAS
  @Default(0)
  @Column
  totalMensagensUsuario: number;

  @Default(0)
  @Column
  totalMensagensCliente: number;

  // DADOS ADICIONAIS
  @Default("waiting")
  @Column
  status: string;

  @Column
  ultimaInteracaoClienteAt: Date;

  @Column
  ultimaInteracaoUsuarioAt: Date;

  @Default(0)
  @Column
  tempoDesdeUltimaInteracao: number;

  @HasMany(() => TicketUserMetrics)
  userMetrics: any[];
}

export default TicketMetrics;
