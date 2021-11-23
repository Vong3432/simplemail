import { Queue, Worker } from "bullmq";
import { MailJob } from "../interfaces/mail.interface";
import config from '../config'
import { Method } from "got/dist/source";
import { GmailAuthConfig } from "../interfaces/gmail-auth.interface";

const webhooksQueue = new Queue(config.webhookQueueName, { connection: config.connection })
const mailQueue = new Queue<MailJob & GmailAuthConfig>(config.queueName, { connection: config.connection })

export const taskWorker = new Worker<{
    targetEmail: string,
    fromEmail: string,
    subject: string,
    text: string,
    webhookCallbackUrl: string,
    method: Method,
    smtpUser: string,
    smtpPass: string,
    html?: string,
    webhookCallbackData?: {},
    localhost?: {
        ip: string;
        host: string;
    }
}>(
    config.taskQueueName,
    async (job) => {
        try {
            console.log(`Processing job ${job.id} of type ${job.name}`);

            await mailQueue.add("send-email", {
                mailOpts: {
                    from: job.data.fromEmail,
                    subject: job.data.subject,
                    text: job.data.text,
                    to: job.data.targetEmail,
                    html: job.data.html,
                },
                user: job.data.smtpUser,
                password: job.data.smtpPass,
            }, {
                attempts: config.maxAttemptsForEmail,
                backoff: { type: "exponential", delay: config.backoffDelay },
            })

            const result = {
                msg: `Send email successfully, calling callback for [${job.data.method}]: ${job.data.webhookCallbackUrl}`,
                data: job.data.webhookCallbackData
            }

            return webhooksQueue.add(
                job.name,
                {
                    fromEmail: job.data.fromEmail,
                    targetEmail: job.data.targetEmail,
                    result,
                    webhookCallbackUrl: job.data.webhookCallbackUrl,
                    webhookCallbackMethod: job.data.method,
                    smtpUser: job.data.smtpUser,
                    smtpPass: job.data.smtpPass,
                    localhost: job.data.localhost,
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