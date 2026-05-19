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
  DataType,
} from "sequelize-typescript";
import User from "./User";
import Company from "./Company";

@Table({ tableName: "PerfilCargo" })
class PerfilCargo extends Model<PerfilCargo> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: any;

  @Column
  codigoCargo: string;

  @Column(DataType.DATEONLY)
  dataEmissao: string;

  @Column
  revisao: string;

  @Column(DataType.DATEONLY)
  dataRevisao: string;

  @Column
  cargo: string;

  @Column
  funcao: string;

  @Column
  cbo: string;

  @Column
  setor: string;

  @Column
  superiorImediato: string;

  @Column(DataType.TEXT)
  subordinados: string;

  @Column(DataType.TEXT)
  missaoCargo: string;

  @Column(DataType.TEXT)
  descricaoSumaria: string;

  @Column(DataType.JSONB)
  competenciasComportamentais: any[];

  @Column(DataType.TEXT)
  formacaoObrigatoria: string;

  @Column(DataType.TEXT)
  formacaoDesejavel: string;

  @Column(DataType.TEXT)
  conhecimentosTecnicos: string;

  @Column(DataType.TEXT)
  conhecimentosDesejaveis: string;

  @Column(DataType.TEXT)
  descricaoAtividades: string;

  @Column(DataType.TEXT)
  responsabilidadesComplementares: string;

  @Column(DataType.TEXT)
  resultadosEsperados: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default PerfilCargo;
