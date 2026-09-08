import { createApp } from './app.js';
import { connectDatabase, env } from './config/index.js';

const startServer = async (): Promise<void> => {
  await connectDatabase();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  const shutdown = (): void => {
    console.info('Gracefully shutting down HTTP server...');
    server.close(() => {
      console.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

void startServer();
