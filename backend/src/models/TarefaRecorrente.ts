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
  BelongsToMany,
  DataType
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";
import Queue from "./Queue";
import Departamento from "./Departamento";
import Cliente from "./Cliente";
import Socio from "./Socio";
import TarefaRecorrenteCliente from "./TarefaRecorrenteCliente";
import TarefaRecorrenteSocio from "./TarefaRecorrenteSocio";
import TarefaRecorrenteUsuario from "./TarefaRecorrenteUsuario";
import EmailTemplate from "./EmailTemplate";
import WhatsappTemplate from "./WhatsappTemplate";

@Table({ tableName: "TarefasRecorrentes" })
class TarefaRecorrente extends Model<TarefaRecorrente> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Informações Gerais
  @Column
  codigo: string;

  @Column
  classificacao: string;

  @Column
  mininome: string;

  @Column
  nomeTarefa: string;

  @Column(DataType.STRING)
  tipoTarefa: string;

  @ForeignKey(() => Departamento)
  @Column
  departamentoId: number;

  @BelongsTo(() => Departamento)
  departamento: any;

  @ForeignKey(() => User)
  @Column
  usuarioResponsavelId: number;

  @BelongsTo(() => User, "usuarioResponsavelId")
  usuarioResponsavel: any;

  // Entregas Mensais
  @Column(DataType.JSON)
  entregasMensais: object;

  // Prazos e Configurações
  @Column
  diasAntecipacao: number;

  @Column
  diasInicio: number;

  @Column
  diasConclusao: number;

  @Column
  tipoDiasAntes: string;

  @Column
  prazosFixos: string;

  @Column
  sabadoUtil: boolean;

  @Column
  competencia: string;

  @Column
  competenciaTipo: string;

  @Column
  exigirRobo: boolean;

  @Column
  passivelMulta: boolean;

  @Column
  alertaGuia: boolean;

  @Column
  checklistObrigatorio: boolean;

  @Column
  prazoEntregaDias: number;

  @Column
  prazoEntregaHoras: number;

  @Column(DataType.STRING)
  esfera: string;

  @Column
  notificarCliente: boolean;

  @Column
  servicoLiberado: boolean;

  @Column
  baixarAutomatico: boolean;

  @Column
  exigeAgendamento: boolean;

  @Column
  habilitarDeclaracao: boolean;

  @Column
  notificaVencimento: boolean;

  @Column
  parecerAutomatico: boolean;

  @Column
  recorrente: boolean;

  @Column
  requerAnexo: boolean;

  @Column
  requerCampoProcesso: boolean;

  @Column
  responderProtocolo: boolean;

  @Column
  ativa: boolean;

  @Column
  retencaoMeses: number;

  @Column
  prazoMinimoRealizacao: number;

  @Column
  semVencimento: boolean;

  @Column(DataType.JSON)
  faseConfig: object;

  // Checklist
  @Column
  checklistId: number;

  // Notificações
  @Column(DataType.JSON)
  canaisNotificacao: string[];

  @ForeignKey(() => EmailTemplate)
  @Column
  emailTemplateId: number;

  @BelongsTo(() => EmailTemplate)
  emailTemplate: any;

  @ForeignKey(() => WhatsappTemplate)
  @Column
  whatsappTemplateId: number;

  @BelongsTo(() => WhatsappTemplate)
  whatsappTemplate: any;

  // Financeiro
  @Column(DataType.DECIMAL(10, 2))
  valor: number;

  // Relacionamentos com Clientes e Sócios
  @BelongsToMany(() => Cliente, {
    through: () => TarefaRecorrenteCliente,
    foreignKey: "tarefaRecorrenteId",
    otherKey: "clienteId"
  })
  clientes: any[];

  @BelongsToMany(() => Socio, {
    through: () => TarefaRecorrenteSocio,
    foreignKey: "tarefaRecorrenteId",
    otherKey: "socioId"
  })
  socios: any[];

  @BelongsToMany(() => User, {
    through: () => TarefaRecorrenteUsuario,
    foreignKey: "tarefaRecorrenteId",
    otherKey: "userId"
  })
  usuarios: any[];

  // Controle
  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @ForeignKey(() => User)
  @Column
  createdBy: number;

  @BelongsTo(() => User, "createdBy")
  creator: any;

  @ForeignKey(() => User)
  @Column
  updatedBy: number;

  @BelongsTo(() => User, "updatedBy")
  updater: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TarefaRecorrente;
