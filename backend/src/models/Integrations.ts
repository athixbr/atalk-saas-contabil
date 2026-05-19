import {
    Table,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    Default,
    DataType,
    AutoIncrement,
    BelongsTo,
    ForeignKey,
    Column
} from "sequelize-typescript";
import Company from "./Company";

@Table
class Integrations extends Model<Integrations> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => Company)
    @Column
    companyId: number;
    @Column(DataType.TEXT)
    type: string;

    @Column
    @Column(DataType.TEXT)
    name: string;
    
    @Column(DataType.TEXT)
    projectName: string;
    
    @Column(DataType.TEXT)
    jsonContent: string;

    @Default(false)
    @Column
    isActive: boolean;
    @Column(DataType.TEXT)
    urlN8N: string;

    @Column(DataType.TEXT)
    language: string;

    @CreatedAt
    @Column(DataType.DATE(6))
    createdAt: Date;

    @UpdatedAt
    @Column(DataType.DATE(6))
    updatedAt: Date;
    dataValues: string | PromiseLike<string>;

    @Column(DataType.TEXT)
    token: string;

    @Column
    foneContact: string;

    @Column
    userLogin: string;

    @Column
    passLogin: string;

    @Column
    initialCurrentMonth: number;
    @BelongsTo(() => Company)
    company: any;
  
}

export default Integrations;