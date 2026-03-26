import winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, json } = winston.format;

const auditFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message} `;
  if (Object.keys(metadata).length > 0) {
    msg += JSON.stringify(metadata);
  }
  return msg;
});

const auditLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { service: 'sgc-audit' },
  transports: [
    // Registro de Auditoria (Ações de usuários, segurança)
    new winston.transports.DailyRotateFile({
      filename: 'logs/audit-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'info'
    }),
    // Registro de Erros Críticos
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    })
  ]
});

// Se estiver em desenvolvimento, logar no console também com cores
if (process.env.NODE_ENV !== 'production') {
  auditLogger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'HH:mm:ss' }),
      auditFormat
    )
  }));
}

export default auditLogger;
