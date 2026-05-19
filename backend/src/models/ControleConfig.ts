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
  DataType,
} from "sequelize-typescript";
import Company from "./Company";
import Departamento from "./Departamento";
import GrupoServico from "./GrupoServico";
import TipoServico from "./TipoServico";
import Prioridade from "./Prioridade";
import Prazo from "./Prazo";
import ControleCliente from "./ControleCliente";

@Table({ tableName: "ControlesConfig" })
class ControleConfig extends Model<ControleConfig> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  codigo: string;

  @Column
  nome: string;

  @ForeignKey(() => Departamento)
  @Column
  departamentoId: number;

  @ForeignKey(() => GrupoServico)
  @Column
  grupoServicoId: number;

  @ForeignKey(() => TipoServico)
  @Column
  tipoServicoId: number;

  @ForeignKey(() => Prioridade)
  @Column
  prioridadeId: number;

  @ForeignKey(() => Prazo)
  @Column
  prazoId: number;

  @Default("interno")
  @Column
  tipoControle: string; // 'interno' | 'cliente'

  @Default(false)
  @Column
  recorrente: boolean;

  @Column(DataType.DECIMAL(10, 2))
  valorReferencial: number;

  @Default(false)
  @Column
  sabadoUtil: boolean;

  @Column
  diasNaoUteis: string; // 'Antecipar' | 'Postergar' | 'Manter'

  @Column
  diasLembrete: number;

  @Default(true)
  @Column
  aceitaArquivos: boolean;

  @Default(true)
  @Column
  ativo: boolean;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @BelongsTo(() => Departamento)
  departamento: any;

  @BelongsTo(() => GrupoServico)
  grupoServico: any;

  @BelongsTo(() => TipoServico)
  tipoServico: any;

  @BelongsTo(() => Prioridade)
  prioridade: any;

  @BelongsTo(() => Prazo)
  prazo: any;

  @HasMany(() => ControleCliente)
  controleClientes: any[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ControleConfig;
