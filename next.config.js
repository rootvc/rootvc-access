module.exports = {
  webpack5: true,

  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      dns: false,
      tls: false,
      net: false,
      "pg-native": false,
      module: false
    };

    // fix for fsevents/chokidar
    config.module.rules.push({
      test: /.node$/,
      loader: 'node-loader',
    });

    return config;
  }
};
