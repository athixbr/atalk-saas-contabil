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
  HasMany,
  Default,
} from "sequelize-typescript";
import Company from "./Company";
import Departamento from "./Departamento";
import Status from "./Status";
import Prazo from "./Prazo";
import TarefaConfigChecklist from "./TarefaConfigChecklist";

@Table({ tableName: "TarefasConfig" })
class TarefaConfig extends Model<TarefaConfig> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  titulo: string;

  @Column
  descricao: string;

  @ForeignKey(() => Departamento)
  @Column
  departamentoId: number;

  @Default(false)
  @Column
  temVencimento: boolean;

  @Column
  diasParaVencimento: number;

  @ForeignKey(() => Status)
  @Column
  statusId: number;

  @Column
  diasLembrete: number;

  @ForeignKey(() => Prazo)
  @Column
  prazoId: number;

  @Default(true)
  @Column
  aceitaArquivos: boolean;

  @Default(true)
  @Column
  ativo: boolean;

  @Default(false)
  @Column
  sabadoUtil: boolean;

  @Column
  diasNaoUteis: string; // 'Antecipar' | 'Postergar' | 'Manter'

  @Default(false)
  @Column
  tarefaInterna: boolean;

  @Column
  valorReferencial: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @BelongsTo(() => Departamento)
  departamento: any;

  @BelongsTo(() => Status)
  status: any;

  @BelongsTo(() => Prazo)
  prazo: any;

  @HasMany(() => TarefaConfigChecklist)
  checklist: any[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TarefaConfig;
