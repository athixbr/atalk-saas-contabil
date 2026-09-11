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
  Default,
  AllowNull,
  DataType,
  Unique,
} from "sequelize-typescript";
import Company from "./Company";
import Cliente from "./Cliente";
import ClienteSocio from "./ClienteSocio";

@Table({ tableName: "Socios" })
class Socio extends Model<Socio> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @BelongsToMany(() => Cliente, () => ClienteSocio)
  clientes: any[];

  @ForeignKey(() => Cliente)
  @Column
  clienteOrigemId: number;

  @BelongsTo(() => Cliente, "clienteOrigemId")
  clienteOrigem: any;

  @Column
  codigoErp: string;

  @Column
  codigoSistema: string;

  // Dados pessoais
  @AllowNull(false)
  @Column
  nome: string;

  @Column(DataType.STRING(18))
  cpf: string;

  @Column(DataType.STRING(20))
  rg: string;

  @Column(DataType.DATEONLY)
  dataNascimento: Date;

  @Default("Brasileira")
  @Column(DataType.STRING(50))
  nacionalidade: string;

  @Column(DataType.STRING(100))
  naturalidade: string;

  @Column(DataType.ENUM("solteiro", "casado", "divorciado", "viuvo", "uniao_estavel"))
  estadoCivil: "solteiro" | "casado" | "divorciado" | "viuvo" | "uniao_estavel";

  @Column(DataType.STRING(100))
  profissao: string;

  // Contato
  @Column(DataType.STRING(20))
  telefone: string;

  @Column(DataType.STRING(20))
  celular: string;

  @Column
  email: string;

  // Endereço
  @Column(DataType.STRING(9))
  cep: string;

  @Column
  logradouro: string;

  @Column(DataType.STRING(10))
  numero: string;

  @Column
  complemento: string;

  @Column
  bairro: string;

  @Column
  cidade: string;

  @Column(DataType.STRING(2))
  estado: string;

  // Dependentes (JSON)
  @Default([])
  @Column(DataType.JSON)
  dependentes: Array<{
    nome: string;
    cpf: string;
    parentesco: string;
    dataNascimento: string;
  }>;

  // Dados bancários
  @Column(DataType.STRING(100))
  banco: string;

  @Column(DataType.STRING(20))
  agencia: string;

  @Column(DataType.STRING(20))
  conta: string;

  @Column(DataType.ENUM("corrente", "poupanca"))
  tipoConta: "corrente" | "poupanca";

  @Column
  chavePix: string;

  // Controle
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

export default Socio;
