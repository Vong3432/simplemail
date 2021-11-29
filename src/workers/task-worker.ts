import { Queue, Worker } from "bullmq";
import config from '../config'
import { Method } from "got/dist/source";
import { EncryptedResult } from "../helpers/encryption/crypto";

const webhooksQueue = new Queue(config.webhookQueueName, { connection: config.connection, defaultJobOptions: { removeOnComplete: true, removeOnFail: 500, } })
const mailQueue = new Queue<EncryptedResult>(config.queueName, { connection: config.connection, defaultJobOptions: { removeOnComplete: true, removeOnFail: 500, } })

export const taskWorker = new Worker<{
    encrypted: EncryptedResult;
    delayInMs?: number;
    webhookCallbackUrl?: string;
    webhookCallbackData?: {};
    webhookCallbackMethod: Method
}>(
    config.taskQueueName,
    async (job) => {
        try {
            console.log(`Processing job ${job.id} of type ${job.name}`);
            console.log(`Processing data ${JSON.stringify(job.data)}`)

            await mailQueue.add("send-email", {
                ...job.data.encrypted
            }, {
                attempts: config.maxAttemptsForEmail,
                backoff: { type: "exponential", delay: config.backoffDelay },
                delay: job.data.delayInMs,
            })

            if (!job.data.webhookCallbackUrl) return;

            const result = {
                msg: `Send email successfully, calling callback`,
                data: job.data.webhookCallbackData
            }

            return webhooksQueue.add(
                job.name,
                {
                    encrypted: job.data.encrypted,
                    webhookCallbackUrl: job.data.webhookCallbackUrl,
                    webhookCallbackMethod: job.data.webhookCallbackMethod,
                    result,
                },
                {
                    attempts: config.maxAttempts,
                    backoff: { type: "exponential", delay: config.backoffDelay },
                }
            );
        } catch (error) {
            console.log("err task worker:", error)
        }

    }, {
    connection: config.connection,
    limiter: config.limiter,
}
)