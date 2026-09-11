import __cjs_sequelize from "sequelize";
const { QueryInterface } = __cjs_sequelize;

// Dias reais de cada mês (limite seguro, sem considerar ano bissexto)
const DIAS_POR_MES: Record<number, number> = {
  1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30,
  7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31
};

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Antes da validação de calendário existir, o formulário deixava salvar
    // qualquer dia (1-31) em qualquer mês, então tarefas cadastradas antes
    // desta correção podem ter, por exemplo, dia 31 em Abril ou dia 30 em
    // Fevereiro. Isso já falhava silenciosamente na geração (resultado.erros,
    // nunca notificado a ninguém quando rodado via cron). Aqui, para cada mês
    // cujo dia salvo excede o limite real, substitui pelo sentinela "ultimo"
    // (interpretação mais provável em contexto contábil: "vence no fechamento
    // do mês"), e loga os registros ajustados para revisão posterior.
    const [tarefas]: any = await queryInterface.sequelize.query(
      `SELECT id, "companyId", "nomeTarefa", "entregasMensais" FROM "TarefasRecorrentes" WHERE "entregasMensais" IS NOT NULL;`
    );

    const ajustados: any[] = [];

    for (const tarefa of tarefas) {
      const entregasMensais = tarefa.entregasMensais || {};
      let alterado = false;
      const novo: Record<string, any> = { ...entregasMensais };

      for (const [mes, valor] of Object.entries(entregasMensais)) {
        if (valor === "" || valor === null || valor === undefined || valor === "ultimo") continue;
        const dia = Number(valor);
        const maxDia = DIAS_POR_MES[Number(mes)];
        if (!Number.isNaN(dia) && maxDia && dia > maxDia) {
          novo[mes] = "ultimo";
          alterado = true;
          ajustados.push({
            tarefaRecorrenteId: tarefa.id,
            companyId: tarefa.companyId,
            nomeTarefa: tarefa.nomeTarefa,
            mes,
            valorAntigo: dia
          });
        }
      }

      if (alterado) {
        await queryInterface.sequelize.query(
          `UPDATE "TarefasRecorrentes" SET "entregasMensais" = :entregasMensais::json WHERE id = :id`,
          {
            replacements: {
              entregasMensais: JSON.stringify(novo),
              id: tarefa.id
            }
          }
        );
      }
    }

    if (ajustados.length > 0) {
      console.log(
        `[migration] entregasMensais fora do calendário ajustados para "ultimo" em ${ajustados.length} mês(es)/tarefa(s):`,
        JSON.stringify(ajustados)
      );
    }
  },

  down: async () => {
    // Não há como recuperar os valores numéricos originais fora do calendário,
    // e não existe motivo de negócio para reverter esta correção de dados.
  }
};
