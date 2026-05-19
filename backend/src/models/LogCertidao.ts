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
import Certidao from "./Certidao";

@Table({ tableName: "LogsCertidoes" })
class LogCertidao extends Model<LogCertidao> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Certidao)
  @Column
  certidaoId: number;

  @BelongsTo(() => Certidao)
  certidao: any;

  @ForeignKey(() => Cliente)
  @Column
  clienteId: number;

  @BelongsTo(() => Cliente)
  cliente: any;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @Column
  tipo: string;

  @Column
  categoria: string;

  @AllowNull(false)
  @Default("em_processamento")
  @Column
  status: "em_processamento" | "sucesso" | "erro" | "timeout";

  @Column
  codigoErro: string;

  @Column(DataType.TEXT)
  mensagemErro: string;

  @Column(DataType.JSON)
  requestData: object;

  @Column(DataType.JSON)
  responseData: object;

  @AllowNull(false)
  @Default(1)
  @Column
  tentativa: number;

  @Column
  tempoResposta: number;

  @Column(DataType.DECIMAL(10, 2))
  custoConsulta: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default LogCertidao;
