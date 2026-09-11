const reportsRoutes = {
  tickets: [
    {
      label: 'Atendimentos',
      to: '/reports/tickets',
    },
    {
      label: 'Duração dos Atendimentos',
      to: '/reports/tickets/duration',
    },
    {
      label: '⏱️ Análise de Tempo',
      to: '/reports/tickets/time-analysis',
    },
    {
      label: '📋 Logs em Tempo Real',
      to: '/reports/tickets/logs',
    },
  ],
  research: [
    {
      label: 'Pesquisas',
      to: '/reports/researchs',
    },
  ],
  groups: [
    {
      label: 'Atendimentos em grupo',
      to: '/reports/groups',
    },
  ],
  performance: [
    {
      label: '👥 Performance de Atendentes',
      to: '/reports/users/performance',
    },
  ],
};

export default reportsRoutes;
