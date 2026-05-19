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
  DataType,
} from "sequelize-typescript";
import ControleCliente from "./ControleCliente";
import User from "./User";
import Company from "./Company";

@Table({ tableName: "ControleClienteHistorico" })
class ControleClienteHistorico extends Model<ControleClienteHistorico> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => ControleCliente)
  @Column
  controleClienteId: number;

  @Column(
    DataType.ENUM(
      "vinculacao",
      "desvinculacao",
      "alteracao_datas",
      "alteracao_responsavel",
      "ativacao",
      "desativacao"
    )
  )
  acao: string;

  @Column(DataType.JSONB)
  dadosAnteriores: any;

  @Column(DataType.JSONB)
  dadosNovos: any;

  @ForeignKey(() => User)
  @Column
  usuarioId: number;

  @Column(DataType.TEXT)
  observacao: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => ControleCliente)
  controleCliente: any;

  @BelongsTo(() => User)
  usuario: any;

  @BelongsTo(() => Company)
  company: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ControleClienteHistorico;
