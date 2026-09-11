const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Handle .mjs files
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
      });

      // Transformar pacotes que usam class fields (fast-png e iobuffer, deps do jspdf)
      webpackConfig.module.rules.push({
        test: /\.(js|mjs|cjs)$/,
        include: [/node_modules\/(fast-png|iobuffer)/],
        use: {
          loader: require.resolve("babel-loader"),
          options: {
            plugins: [
              require.resolve("@babel/plugin-proposal-class-properties"),
            ],
            cacheDirectory: true,
            cacheCompression: false,
            compact: false,
          },
        },
      });

      // Skip performance hints (evita processamento extra)
      webpackConfig.performance = false;

      // Evita travamento do build em ambientes com pouca CPU/RAM.
      // A minificação via Terser estava prendendo o build em
      // "Creating an optimized production build..." sem gerar bundles.
      if (webpackConfig.optimization) {
        webpackConfig.optimization.minimize = false;
      }

      // Desativar scope hoisting reduz pico de memória no link dos módulos
      webpackConfig.optimization.concatenateModules = false;

      webpackConfig.plugins.push(
        new webpack.ProgressPlugin({
          activeModules: true,
          handler: (percentage, message, ...args) => {
            const pct = Math.round(percentage * 100);
            if (pct % 10 === 0 || pct >= 95) {
              const detail = args.filter(Boolean).join(" ");
              console.log(`[webpack] ${pct}% ${message}${detail ? ` ${detail}` : ""}`);
            }
          },
        })
      );

      return webpackConfig;
    },
  },
};
