import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("ClienteSocio", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      
      // Relacionamentos N:N
      clienteId: {
        type: DataTypes.INTEGER,
        references: { model: "Clientes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      socioId: {
        type: DataTypes.INTEGER,
        references: { model: "Socios", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      
      // Dados societários
      percentual: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: "Percentual de participação (0.00 a 100.00)"
      },
      cargo: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Ex: Sócio Administrador, Sócio Quotista, Diretor"
      },
      valorQuota: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: "Valor nominal da quota"
      },
      quantidadeQuotas: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Quantidade de quotas"
      },
      
      // Timeline
      dataEntrada: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "Data de entrada na sociedade"
      },
      dataSaida: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "Data de saída da sociedade"
      },
      
      // Poderes e responsabilidades
      podeAssinar: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Possui poder de assinatura"
      },
      poderIsolado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Pode assinar isoladamente (sem necessidade de outro sócio)"
      },
      isAdministrador: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "É administrador da empresa"
      },
      
      // Pró-labore
      recebeProlabore: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Recebe pró-labore"
      },
      valorProlabore: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: "Valor mensal do pró-labore"
      },
      
      // Controle
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "Vínculo ativo na sociedade"
      },
      
      // Timestamps
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("ClienteSocio");
  }
};
