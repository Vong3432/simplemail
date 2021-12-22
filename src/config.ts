import dotenv from 'dotenv'

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

function redisCredential() {
    const tlsUrl = process.env.REDIS_TLS_URL

    if (!tlsUrl) return null;

    // find index before substring
    const passwordIndex = tlsUrl.indexOf("rediss://:") + 10 // "rediss://:" length is 10
    const hostIndex = tlsUrl.indexOf("@") + 1
    const portIndex = tlsUrl.lastIndexOf(":") + 1

    // extract
    const host = tlsUrl.substring(hostIndex, portIndex - 1)
    const password = tlsUrl.substring(passwordIndex, hostIndex - 1)
    const port = tlsUrl.substring(portIndex)

    return {
        host,
        port,
        password
    }
}

export default {
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || "1"),
    queueName: process.env.QUEUE_NAME || "mailbot",
    taskQueueName: process.env.TASKS_QUEUE_NAME || "tasks",
    webhookQueueName: process.env.WEBHOOK_QUEUE_NAME || "webhooks",
    connection: process.env.NODE_ENV === 'production' ? {
        ...redisCredential(),
        db: 0,
        keyPrefix: '',
        tls: {
            rejectUnauthorized: false,
        },
    } : {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || "6379"),
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
    userPort: process.env.USER_PORT || 8080,
    encryption: {
        algorithm: process.env.ENCRYPTION_ALGORITHM,
        secretKey: process.env.ENCRYPTION_SECRET_KEY
    }
};