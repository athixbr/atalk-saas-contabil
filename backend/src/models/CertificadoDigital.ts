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
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";

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
