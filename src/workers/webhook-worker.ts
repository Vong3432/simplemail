import { Queue, Worker } from "bullmq";
import got, { Method } from "got/dist/source";
import { MailJob } from "../interfaces/mail.interface";
import config from "../config";

const mailQueue = new Queue<MailJob>(config.queueName, {
    connection: config.connection,
});

export const webhooksWorker = new Worker<{
    targetEmail: string;
    fromEmail: string;
    result: {};
    webhookCallbackUrl: string;
    webhookCallbackMethod: Method;
}>(
    config.webhookQueueName,
    async (job) => {
        const { result, targetEmail, webhookCallbackUrl, webhookCallbackMethod } = job.data
        const maxWebhookAttempts = config.maxAttempts - config.maxAttemptsForEmail;

        if (job.attemptsMade < maxWebhookAttempts) {
            console.log(
                `Job #${job.id} Calling webhook to "${job.data.webhookCallbackUrl}", attempt ${job.attemptsMade + 1
                } of ${maxWebhookAttempts}`
            );

            const response = await got(webhookCallbackUrl, {
                method: webhookCallbackMethod,
                json: webhookCallbackMethod === "GET" ? undefined : { ...result },
            })

            if (response.statusCode >= 200 && response.statusCode < 300)
                console.log(`Response ok ${response.statusCode}`)
            else
                console.log(`Response not ok ${response.statusCode}`)

        } else {
            console.log(
                `Giving up, lets mail user about webhook not working for "${result}"`
            );
            // Send an email to the user about failing webhooks.
            return mailQueue.add("webhook-failure", {
                mailOpts: {
                    from: config.fromEmail!,
                    subject: "Your Webhook is failing",
                    text: `We are not able to send reqeust to your callback url ${webhookCallbackUrl} for ${maxWebhookAttempts} times.`,
                    to: job.data.fromEmail,
                }
            });
        }
    },
    {
        connection: config.connection,
    }
);
