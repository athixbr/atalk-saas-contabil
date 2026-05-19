import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("PerfilCargo", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
        unique: true, // Um usuário só pode ter um perfil
      },
      // Informações Básicas
      codigoCargo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dataEmissao: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      revisao: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dataRevisao: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      
      // Cargo e Função
      cargo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      funcao: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      cbo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      // Hierarquia
      setor: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      superiorImediato: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subordinados: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      
      // Descrições
      missaoCargo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      descricaoSumaria: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      
      // Competências (JSON para flexibilidade)
      competenciasComportamentais: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      
      // Competências Técnicas
      formacaoObrigatoria: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      formacaoDesejavel: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      conhecimentosTecnicos: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      conhecimentosDesejaveis: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      
      // Atividades e Resultados
      descricaoAtividades: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      responsabilidadesComplementares: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      resultadosEsperados: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      
      // Controle
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("PerfilCargo");
  },
};
