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
  HasMany,
  DataType
} from "sequelize-typescript";
import Company from "./Company";
import Certidao from "./Certidao";

@Table({ tableName: "AgendamentosCertidoes" })
class AgendamentoCertidao extends Model<AgendamentoCertidao> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  data: Date;

  @AllowNull(false)
  @Column(DataType.TIME)
  hora: string;

  @Column(DataType.TEXT)
  descricao: string;

  @AllowNull(false)
  @Default([])
  @Column(DataType.JSON)
  clienteIds: number[];

  @AllowNull(false)
  @Default([])
  @Column(DataType.JSON)
  certidoesCategoriasIds: string[];

  @AllowNull(false)
  @Default(3)
  @Column(DataType.INTEGER)
  intervaloMinutos: number;

  @AllowNull(false)
  @Default("pendente")
  @Column
  status: "pendente" | "processando" | "concluido" | "erro";

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Certidao, "agendamentoId")
  certidoes: any[];
}

export default AgendamentoCertidao;
