import __cjs_sequelize from "sequelize";
const { QueryInterface } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Índices para melhorar performance de buscas em ControleClientes
    await queryInterface.addIndex("ControleClientes", ["controleConfigId"], {
      name: "idx_controle_clientes_controle_config_id",
    });

    await queryInterface.addIndex("ControleClientes", ["clienteId"], {
      name: "idx_controle_clientes_cliente_id",
    });

    await queryInterface.addIndex("ControleClientes", ["departamentoId"], {
      name: "idx_controle_clientes_departamento_id",
    });

    await queryInterface.addIndex("ControleClientes", ["usuarioId"], {
      name: "idx_controle_clientes_usuario_id",
    });

    await queryInterface.addIndex("ControleClientes", ["ativo"], {
      name: "idx_controle_clientes_ativo",
    });

    await queryInterface.addIndex("ControleClientes", ["dataInicio", "dataFim"], {
      name: "idx_controle_clientes_datas",
    });

    // Índice composto para buscar controles ativos por cliente
    await queryInterface.addIndex("ControleClientes", ["clienteId", "ativo"], {
      name: "idx_controle_clientes_cliente_ativo",
    });

    // Índice composto para buscar controles por configuração e status
    await queryInterface.addIndex("ControleClientes", ["controleConfigId", "ativo"], {
      name: "idx_controle_clientes_config_ativo",
    });

    // Índices para ControleClienteHistorico
    await queryInterface.addIndex("ControleClienteHistorico", ["controleClienteId"], {
      name: "idx_controle_historico_controle_cliente_id",
    });

    await queryInterface.addIndex("ControleClienteHistorico", ["usuarioId"], {
      name: "idx_controle_historico_usuario_id",
    });

    await queryInterface.addIndex("ControleClienteHistorico", ["companyId"], {
      name: "idx_controle_historico_company_id",
    });

    await queryInterface.addIndex("ControleClienteHistorico", ["acao"], {
      name: "idx_controle_historico_acao",
    });

    await queryInterface.addIndex("ControleClienteHistorico", ["createdAt"], {
      name: "idx_controle_historico_created_at",
    });

    // Índices para ControleNotificacoes
    await queryInterface.addIndex("ControleNotificacoes", ["controleClienteId"], {
      name: "idx_controle_notif_controle_cliente_id",
    });

    await queryInterface.addIndex("ControleNotificacoes", ["controleConfigId"], {
      name: "idx_controle_notif_controle_config_id",
    });

    await queryInterface.addIndex("ControleNotificacoes", ["clienteId"], {
      name: "idx_controle_notif_cliente_id",
    });

    await queryInterface.addIndex("ControleNotificacoes", ["departamentoId"], {
      name: "idx_controle_notif_departamento_id",
    });

    await queryInterface.addIndex("ControleNotificacoes", ["usuarioId"], {
      name: "idx_controle_notif_usuario_id",
    });

    await queryInterface.addIndex("ControleNotificacoes", ["lida"], {
      name: "idx_controle_notif_lida",
    });

    await queryInterface.addIndex("ControleNotificacoes", ["tipo"], {
      name: "idx_controle_notif_tipo",
    });

    await queryInterface.addIndex("ControleNotificacoes", ["companyId"], {
      name: "idx_controle_notif_company_id",
    });

    // Índice composto para buscar notificações não lidas por usuário
    await queryInterface.addIndex("ControleNotificacoes", ["usuarioId", "lida"], {
      name: "idx_controle_notif_usuario_lida",
    });

    // Índice composto para buscar notificações não lidas por departamento
    await queryInterface.addIndex("ControleNotificacoes", ["departamentoId", "lida"], {
      name: "idx_controle_notif_dept_lida",
    });

    // Índice para buscar notificações por data de criação
    await queryInterface.addIndex("ControleNotificacoes", ["createdAt"], {
      name: "idx_controle_notif_created_at",
    });
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover índices de ControleClientes
    await queryInterface.removeIndex("ControleClientes", "idx_controle_clientes_controle_config_id");
    await queryInterface.removeIndex("ControleClientes", "idx_controle_clientes_cliente_id");
    await queryInterface.removeIndex("ControleClientes", "idx_controle_clientes_departamento_id");
    await queryInterface.removeIndex("ControleClientes", "idx_controle_clientes_usuario_id");
    await queryInterface.removeIndex("ControleClientes", "idx_controle_clientes_ativo");
    await queryInterface.removeIndex("ControleClientes", "idx_controle_clientes_datas");
    await queryInterface.removeIndex("ControleClientes", "idx_controle_clientes_cliente_ativo");
    await queryInterface.removeIndex("ControleClientes", "idx_controle_clientes_config_ativo");

    // Remover índices de ControleClienteHistorico
    await queryInterface.removeIndex("ControleClienteHistorico", "idx_controle_historico_controle_cliente_id");
    await queryInterface.removeIndex("ControleClienteHistorico", "idx_controle_historico_usuario_id");
    await queryInterface.removeIndex("ControleClienteHistorico", "idx_controle_historico_company_id");
    await queryInterface.removeIndex("ControleClienteHistorico", "idx_controle_historico_acao");
    await queryInterface.removeIndex("ControleClienteHistorico", "idx_controle_historico_created_at");

    // Remover índices de ControleNotificacoes
    await queryInterface.removeIndex("ControleNotificacoes", "idx_controle_notif_controle_cliente_id");
    await queryInterface.removeIndex("ControleNotificacoes", "idx_controle_notif_controle_config_id");
    await queryInterface.removeIndex("ControleNotificacoes", "idx_controle_notif_cliente_id");
    await queryInterface.removeIndex("ControleNotificacoes", "idx_controle_notif_departamento_id");
    await queryInterface.removeIndex("ControleNotificacoes", "idx_controle_notif_usuario_id");
    await queryInterface.removeIndex("ControleNotificacoes", "idx_controle_notif_lida");
    await queryInterface.removeIndex("ControleNotificacoes", "idx_controle_notif_tipo");
    await queryInterface.removeIndex("ControleNotificacoes", "idx_controle_notif_company_id");
    await queryInterface.removeIndex("ControleNotificacoes", "idx_controle_notif_usuario_lida");
    await queryInterface.removeIndex("ControleNotificacoes", "idx_controle_notif_dept_lida");
    await queryInterface.removeIndex("ControleNotificacoes", "idx_controle_notif_created_at");
  },
};
