import { Queue } from "bullmq";
import express, { Request } from "express"

// middlewares
import checkSendEmailSchema, { SendMailRequestBody } from "../../middlewares/send-email-schema-check";
import timeConversion from "../../middlewares/time-conversion";
import encryptBody from "../../middlewares/encrypt-body";

import config from "../../config";
import { Method } from "got/dist/source";

import { EncryptedResult } from "../../helpers/encryption/crypto";

const router = express.Router()
const taskQueue = new Queue(config.taskQueueName, { connection: config.connection });

router.post('/send-email', [checkSendEmailSchema, timeConversion, encryptBody], async (req: Request<any, any, SendMailRequestBody & { encrypted: EncryptedResult } & { delayInMs?: number }, any>, res: any) => {
    const targetEmail = req.body.email
    const encryptedText = req.body.encrypted
    const delayInMs = req.body.delayInMs
    const webhookCallbackUrl = req.body.callback_url
    const webhookCallbackData = req.body.callback_data
    const webhookCallbackMethod = req.body.method

    taskQueue
        .add(
            targetEmail,
            {
                delayInMs,
                encrypted: encryptedText,
                webhookCallbackUrl,
                webhookCallbackData,
                webhookCallbackMethod
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