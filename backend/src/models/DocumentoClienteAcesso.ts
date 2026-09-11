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
import TipoConta from "./TipoConta";

@Table({ tableName: "DocumentoClienteAcessos" })
class DocumentoClienteAcesso extends Model<DocumentoClienteAcesso> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @ForeignKey(() => Cliente)
  @AllowNull(false)
  @Column
  clienteId: number;

  @BelongsTo(() => Cliente)
  cliente: any;

  @ForeignKey(() => TipoConta)
  @Column
  tipoContaId: number;

  @BelongsTo(() => TipoConta)
  tipoConta: any;

  @AllowNull(false)
  @Default("gov")
  @Column
  tipo: string;

  @Default(false)
  @Column
  doisFatoresAtivo: boolean;

  @AllowNull(false)
  @Column
  usuario: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  senhaEncriptada: string;

  @Column(DataType.TEXT)
  observacoes: string;

  @Default(true)
  @Column
  ativo: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default DocumentoClienteAcesso;
