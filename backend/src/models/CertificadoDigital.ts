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

@Table({ tableName: "CertificadosDigitais" })
class CertificadoDigital extends Model<CertificadoDigital> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @ForeignKey(() => Cliente)
  @Column
  clienteId: number;

  @BelongsTo(() => Cliente)
  cliente: any;

  @AllowNull(false)
  @Column
  nomeArquivo: string;

  @AllowNull(false)
  @Column
  caminhoArquivo: string;

  @AllowNull(false)
  @Column
  senhaEncriptada: string;

  @Default("A1")
  @Column
  tipo: string;

  @Column
  titular: string;

  @Column
  cpfCnpj: string;

  @Column
  emissor: string;

  @Column
  dataInicio: Date;

  @AllowNull(false)
  @Column
  validade: Date;

  @Column
  algoritmo: string;

  @Column
  serialNumber: string;

  @Default(false)
  @Column
  notificarEmail: boolean;

  @Default(false)
  @Column
  notificarWhatsapp: boolean;

  @Default([45, 30, 15, 5])
  @Column(DataType.JSON)
  lembretesDias: number[];

  @Default([])
  @Column(DataType.JSON)
  notificacoesEnviadas: any[];

  @AllowNull(false)
  @Default(true)
  @Column
  ativo: boolean;

  @AllowNull(false)
  @Default(new Date())
  @Column
  dataUpload: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CertificadoDigital;
