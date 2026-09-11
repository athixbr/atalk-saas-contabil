import {
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  Default,
  BeforeCreate,
  BeforeUpdate,
} from "sequelize-typescript";
import { hash, compare } from "bcryptjs";
import ClienteContato from "./ClienteContato";
import Company from "./Company";

@Table({ tableName: "ContatoAppAcessos" })
class ContatoAppAcesso extends Model<ContatoAppAcesso> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => ClienteContato)
  @Column
  clienteContatoId: number;

  @BelongsTo(() => ClienteContato)
  clienteContato: any;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: any;

  @Default(false)
  @Column
  ativo: boolean;

  @Column(DataType.VIRTUAL)
  senha: string;

  @Column
  senhaHash: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BeforeUpdate
  @BeforeCreate
  static hashSenha = async (instance: ContatoAppAcesso): Promise<void> => {
    if (instance.senha) {
      instance.senhaHash = await hash(instance.senha, 8);
    }
  };

  public checkSenha = async (senha: string): Promise<boolean> => {
    return compare(senha, this.getDataValue("senhaHash"));
  };
}

export default ContatoAppAcesso;
