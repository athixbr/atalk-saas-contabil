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

@Table({ tableName: "ClientesCertidoes" })
class ClienteCertidao extends Model<ClienteCertidao> {
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
  nome: string;

  @AllowNull(false)
  @Default("fisica")
  @Column
  tipoCliente: "fisica" | "juridica";

  @Column
  cpf: string;

  @Column
  cnpj: string;

  @Column
  razaoSocial: string;

  @Column
  inscricaoEstadual: string;

  @Column
  inscricaoMunicipal: string;

  @Column
  cep: string;

  @Column
  logradouro: string;

  @Column
  numero: string;

  @Column
  complemento: string;

  @Column
  bairro: string;

  @Column
  cidade: string;

  @Column
  estado: string;

  @Column
  telefone: string;

  @Column
  email: string;

  @Default([])
  @Column(DataType.JSON)
  certidoesSelecionadas: string[];

  @AllowNull(false)
  @Default(true)
  @Column
  ativo: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Certidao, "clienteId")
  certidoes: any[];
}

export default ClienteCertidao;
