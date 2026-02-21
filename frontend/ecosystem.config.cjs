module.exports = {
  apps: [
    {
      name: 'ngaji-frontend',
      cwd: __dirname,
      script: 'npm',
      args: 'run preview -- --host 0.0.0.0 --port 4173',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
