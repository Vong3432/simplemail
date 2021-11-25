import { Queue } from "bullmq";
import express, { Request } from "express"

// middlewares
import checkSendEmailSchema from "../../middlewares/send-email-schema-check";
import timeConversion from "../../middlewares/time-conversion";

import config from "../../config";
import { Method } from "got/dist/source";

const router = express.Router()
const taskQueue = new Queue(config.taskQueueName, { connection: config.connection });

router.post('/send-email', [checkSendEmailSchema, timeConversion], async (req: Request, res: any) => {
    const targetEmail = req.body.email
    // const fromEmail = req.body.from
    const fromEmail = req.body.from
    const subject = req.body.subject
    const text = req.body.text
    const webhookCallbackUrl = req.body.callback_url
    const method: Method = req.body.method
    const html = req.body.html
    const webhookCallbackData = req.body.callback_data
    const smtpUser = req.body.smtp_user
    const smtpPass = req.body.smtp_pass
    const delayInMs = req.body.delayInMs
    // const isLocalhost = req.body.localhost ?? false

    taskQueue
        .add(
            targetEmail,
            {
                targetEmail,
                fromEmail,
                subject,
                text,
                webhookCallbackUrl,
                method,
                html,
                smtpUser,
                smtpPass,
                webhookCallbackData,
                delayInMs,
                // localhost: isLocalhost === true ? {
                //     host: req.hostname,
                //     ip: req.ip,
                // } : undefined
            })
        .then(
            (job) => {
                res.status(201).json({
                    msg: "Success"
                })
            },
            (err) => {
                console.error("Client server err", err)
                res.status(500).end(`Something went wrong on this servcie: ${err}`)
            }
        )
});

export default router