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
  HasOne,
  HasMany,
  DataType
} from "sequelize-typescript";
import Company from "./Company";
import Departamento from "./Departamento";
import TipoServico from "./TipoServico";
import GrupoServico from "./GrupoServico";
import TarefaEntregaMensal from "./TarefaEntregaMensal";
import TarefaPrazoConfig from "./TarefaPrazoConfig";
import TarefaChecklist from "./TarefaChecklist";
import TarefaDocumento from "./TarefaDocumento";
import TarefaNotificacao from "./TarefaNotificacao";
import TarefaFinanceiro from "./TarefaFinanceiro";

@Table({ tableName: "TarefasInfoGerais" })
class TarefaInfoGeral extends Model<TarefaInfoGeral> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @Column
  codigo: string;

  @Column
  classificacao: string;

  @Column
  mininome: string;

  @Column
  nomeObrigacao: string;

  @ForeignKey(() => Departamento)
  @Column
  departamentoId: number;

  @BelongsTo(() => Departamento)
  departamento: any;

  @ForeignKey(() => TipoServico)
  @Column
  tipoServicoId: number;

  @BelongsTo(() => TipoServico)
  tipoServico: any;

  @ForeignKey(() => GrupoServico)
  @Column
  grupoServicoId: number;

  @BelongsTo(() => GrupoServico)
  grupoServico: any;

  @Column
  titulo: string;

  @Column(DataType.TEXT)
  descricao: string;

  @Column(DataType.BOOLEAN)
  obrigatorio: boolean;

  @Column(DataType.ENUM("Federal", "Estadual", "Municipal", "Interno", "Outros"))
  esfera: string;

  @Column(DataType.BOOLEAN)
  exigeRobo: boolean;

  @Column(DataType.BOOLEAN)
  passivelMulta: boolean;

  @Column(DataType.BOOLEAN)
  alertaGuiaNaoLida: boolean;

  @Column(DataType.BOOLEAN)
  notificarCliente: boolean;

  @Column(DataType.BOOLEAN)
  servicoLiberadoNoApp: boolean;

  @Column(DataType.ENUM("Matriz/Filial", "Apenas Matriz", "Apenas Filial"))
  gerarPara: string;

  @Column(DataType.BOOLEAN)
  ativa: boolean;

  @Column(DataType.TEXT)
  observacao: string;

  @HasOne(() => TarefaEntregaMensal)
  entregaMensal: any;

  @HasOne(() => TarefaPrazoConfig)
  prazoConfig: any;

  @HasMany(() => TarefaChecklist)
  checklists: any[];

  @HasMany(() => TarefaDocumento)
  documentos: any[];

  @HasMany(() => TarefaNotificacao)
  notificacoes: any[];

  @HasOne(() => TarefaFinanceiro)
  financeiro: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TarefaInfoGeral;
