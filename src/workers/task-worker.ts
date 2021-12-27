import { FlowProducer, Queue, Worker } from "bullmq";
import config from '../config'
import { Method } from "got/dist/source";
import { EncryptedResult } from "../helpers/encryption/crypto";

const flowProducer = new FlowProducer({ connection: config.connection })
export const webhooksQueue = new Queue(config.webhookQueueName, { connection: config.connection, defaultJobOptions: { removeOnComplete: true, removeOnFail: 500, } })
export const mailQueue = new Queue<EncryptedResult>(config.queueName, { connection: config.connection, defaultJobOptions: { removeOnComplete: true, removeOnFail: 500, } })

export const taskWorker = new Worker<{
    customJobId: string,
    customMailJobId: string,
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

            const flow = await flowProducer.add(job.data.webhookCallbackUrl ? {
                name: job.name,
                queueName: config.webhookQueueName,
                data: {
                    encrypted: job.data.encrypted,
                    webhookCallbackUrl: job.data.webhookCallbackUrl,
                    webhookCallbackMethod: job.data.webhookCallbackMethod,
                    result: {
                        msg: `Send email successfully, calling callback`,
                        data: job.data.webhookCallbackData
                    },
                },
                opts: {
                    attempts: config.maxAttempts,
                    backoff: { type: "exponential", delay: config.backoffDelay },
                    jobId: job.data.customJobId,
                },
                children: [
                    {
                        name: "send-email",
                        data: {
                            ...job.data.encrypted
                        },
                        queueName: config.queueName,
                        opts: {
                            attempts: config.maxAttemptsForEmail,
                            backoff: { type: "exponential", delay: config.backoffDelay },
                            delay: job.data.delayInMs,
                            jobId: job.data.customMailJobId,
                        },
                    },
                ]
            } : {
                name: "send-email",
                data: {
                    ...job.data.encrypted
                },
                queueName: config.queueName,
                opts: {
                    attempts: config.maxAttemptsForEmail,
                    backoff: { type: "exponential", delay: config.backoffDelay },
                    delay: job.data.delayInMs,
                    jobId: job.data.customMailJobId,
                },
            })

            console.log("Flow done")
        } catch (error) {
            console.log("err task worker:", error)
        }

    }, {
    connection: config.connection,
    limiter: config.limiter,
}
)