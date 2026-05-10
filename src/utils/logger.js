const getTime = () => new Date().toTimeString().split(' ')[0]

export const logger = {
  info: (msg) => console.log(`[${getTime()}] [INFO] ${msg}`),
  warn: (msg) => console.warn(`[${getTime()}] [WARN] ${msg}`),
  error: (msg) => console.error(`[${getTime()}] [ERROR] ${msg}`),
}