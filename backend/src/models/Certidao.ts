import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  ForeignKey,
  BelongsTo,
  DataType
} from "sequelize-typescript";
import Company from "./Company";
import Cliente from "./Cliente";
import AgendamentoCertidao from "./AgendamentoCertidao";

@Table({ tableName: "Certidoes" })
class Certidao extends Model<Certidao> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @AllowNull(true)
  @ForeignKey(() => Cliente)
  @Column
  clienteId: number;

  @BelongsTo(() => Cliente)
  cliente: any;

  @AllowNull(false)
  @Column
  tipo: "federal" | "estadual" | "municipal";

  @AllowNull(false)
  @Column
  categoria: string;

  @AllowNull(false)
  @Default("pendente")
  @Column
  status: "pendente" | "emitida" | "erro";

  @Column(DataType.TEXT)
  mensagemErro: string;

  @Column
  arquivoPdf: string;

  @Column
  dataEmissao: Date;

  @Column
  validade: Date;

  @AllowNull(false)
  @Default(new Date())
  @Column
  dataConsulta: Date;

  @Column
  origemApi: string;

  @Column(DataType.JSON)
  dadosResposta: object;

  @ForeignKey(() => AgendamentoCertidao)
  @Column
  agendamentoId: number;

  @BelongsTo(() => AgendamentoCertidao)
  agendamento: any;

  @Column
  proximaTentativa: Date;

  @AllowNull(false)
  @Default(0)
  @Column
  tentativasRealizadas: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Certidao;
