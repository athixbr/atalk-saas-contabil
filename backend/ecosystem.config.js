module.exports = {
  apps: [{
    name: 'atalk-backend',
    script: './dist/src/server.js',
    cwd: '/home/deploy/atalk/backend',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    // Desabilitar tracing que causa problemas com ESM
    disable_trace: true,
    trace: false,
    pmx: false
  }]
};
