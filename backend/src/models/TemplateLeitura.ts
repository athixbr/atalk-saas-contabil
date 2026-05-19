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
  DataType
} from "sequelize-typescript";
import Company from "./Company";

interface CampoTemplate {
  nome: string;
  tipo: "text" | "number" | "currency" | "date" | "cpf" | "cnpj" | "barcode" | "email";
  regex: string;
  obrigatorio: boolean;
  transformacao?: string;
  descricao?: string;
}

@Table({ tableName: "TemplatesLeitura" })
class TemplateLeitura extends Model<TemplateLeitura> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  nome: string;

  @Column(DataType.TEXT)
  descricao: string;

  @Column
  tipo: string; // 'guia_fgts', 'guia_inss', 'darf', 'certidao', 'boleto', etc

  @Default(true)
  @Column
  ativo: boolean;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column(DataType.JSONB)
  campos: CampoTemplate[]; // Array de campos a extrair

  @Column(DataType.JSONB)
  validacoes: any; // Regras de validação customizadas

  @Column(DataType.JSONB)
  exemplos: any; // Exemplos de documentos e resultados esperados

  @BelongsTo(() => Company)
  company: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TemplateLeitura;
export { CampoTemplate };
