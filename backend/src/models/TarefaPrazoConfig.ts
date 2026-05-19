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
  DataType
} from "sequelize-typescript";
import Company from "./Company";
import TarefaInfoGeral from "./TarefaInfoGeral";

@Table({ tableName: "TarefasPrazosConfigs" })
class TarefaPrazoConfig extends Model<TarefaPrazoConfig> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @ForeignKey(() => TarefaInfoGeral)
  @Column
  tarefaInfoId: number;

  @BelongsTo(() => TarefaInfoGeral)
  tarefaInfo: any;

  @Column(DataType.INTEGER)
  quantidadeDiasAnteciparEntrega: number;

  @Column(DataType.INTEGER)
  quantidadeDiasIniciar: number;

  @Column(DataType.ENUM("Dias úteis", "Dias corridos"))
  tipoDosdiasAntes: string;

  @Column(DataType.ENUM("Antecipar para o dia útil anterior", "Postergar para o próximo dia útil", "Manter o dia exato"))
  prazosFixosDiasNaoUteis: string;

  @Column(DataType.ENUM("S", "N"))
  sabadoUtil: string;

  @Column(DataType.ENUM("Mês anterior", "2 meses antes", "3 meses antes", "Ano anterior", "Ano atual", "Mês atual", "Mês seguinte"))
  competenciaReferencia: string;

  @Column(DataType.ENUM("S", "N"))
  obrigatorioChecklist: string;

  @Column(DataType.ENUM("Sim", "Não"))
  baixarAutomaticamenteTarefaAoConcluirAtividades: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TarefaPrazoConfig;
