module.exports = {
    serverRuntimeConfig: {
      PROJECT_ROOT: __dirname
    },
    env: {
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
      GOOGLE_CX: process.env.GOOGLE_CX,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    },
    webpack: (config, { isServer, webpack }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
        };
      }
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(https?|http2|fs)$/,
        })
      );
      return config;
    },
  }