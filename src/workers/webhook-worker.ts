import { Queue, Worker } from "bullmq";
import got, { Method } from "got/dist/source";
import config from "../config";
import { EncryptedResult } from "../helpers/encryption/crypto";

const mailQueue = new Queue<EncryptedResult>(config.queueName, {
    connection: config.connection,
    defaultJobOptions: { removeOnComplete: true, removeOnFail: 500, }
});

export const webhooksWorker = new Worker<{
    encrypted: EncryptedResult;
    webhookCallbackUrl: string;
    webhookCallbackMethod: Method;
    result: {}
}>(
    config.webhookQueueName,
    async (job) => {
        const { result, webhookCallbackUrl, webhookCallbackMethod } = job.data
        const maxWebhookAttempts = config.maxAttempts - config.maxAttemptsForEmail;

        if (job.attemptsMade < maxWebhookAttempts) {
            console.log(
                `Job #${job.id} Calling webhook to "${job.data.webhookCallbackUrl}", attempt ${job.attemptsMade + 1
                } of ${maxWebhookAttempts}`
            );

            const response = await got(webhookCallbackUrl, {
                method: webhookCallbackMethod,
                json: webhookCallbackMethod === "GET" ? undefined : { ...result },
                // localAddress: job.data.localhost?.ip,
                // https: {
                //     rejectUnauthorized: job.data.localhost ? false : true
                // }
            })

            if (response.statusCode >= 200 && response.statusCode < 300)
                console.log(`Response ok ${response.statusCode}`)
            else
                console.log(`Response not ok ${response.statusCode}`)

        } else {
            console.log(
                `Giving up, lets mail user about webhook not working for "${JSON.stringify(result)}"`
            );
            // Send an email to the user about failing webhooks.
            return mailQueue.add("webhook-failure", job.data.encrypted);
        }
    },
    {
        connection: config.connection,
    }
);
