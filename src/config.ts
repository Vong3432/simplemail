import dotenv from 'dotenv'

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

export default {
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || "1"),
    queueName: process.env.QUEUE_NAME || "mailbot",
    taskQueueName: process.env.TASKS_QUEUE_NAME || "tasks",
    webhookQueueName: process.env.WEBHOOK_QUEUE_NAME || "webhooks",
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
        db: 0,
        keyPrefix: '',
        tls: {
            rejectUnauthorized: false,
        },
    },
    smtpAppPass: process.env.APP_PASSWORD,
    fromEmail: process.env.FROM_EMAIL,
    processorPath: __dirname + "/processors",
    maxAttempts: 10,
    maxAttemptsForEmail: 5,
    backoffDelay: 2000,
    limiter: {
        max: parseInt(process.env.MAX_LIMIT || "5"),
        duration: parseInt(process.env.DURATION_LIMIT || "1000")
    },
    userPort: process.env.USER_PORT || 8080
};