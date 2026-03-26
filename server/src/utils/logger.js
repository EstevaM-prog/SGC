import pino from 'pino';
import fs from 'fs';
import path from 'path';

// Garante que o diretório de logs existe
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const transport = pino.transport({
  targets: [
    {
      target: 'pino-pretty',
      options: { colorize: true },
      level: 'info'
    },
    {
      target: 'pino/file',
      options: { destination: path.join(logDir, 'error.log') },
      level: 'error'
    }
  ]
});

const logger = pino(transport);

export default logger;
