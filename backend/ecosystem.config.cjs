module.exports = {
  apps: [
    {
      name: 'ngaji-backend',
      cwd: __dirname,
      script: 'node',
      args: 'dist/server.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
