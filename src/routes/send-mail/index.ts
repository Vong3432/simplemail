import { delay, Job, Queue } from "bullmq";
import express, { Request } from "express"

import { v4 as uuidv4 } from 'uuid';

// middlewares
import checkSendEmailSchema, { SendMailRequestBody } from "../../middlewares/send-email-schema-check";
import timeConversion from "../../middlewares/time-conversion";
import encryptBody from "../../middlewares/encrypt-body";
import config from "../../config";

import { EncryptedResult } from "../../helpers/encryption/crypto";
import { CancelJobError } from "../../utils/errors/CancelJobError";
import { InvalidJobIdError } from "../../utils/errors/InvalidJobIdError";
import { mailQueue, webhooksQueue } from "../../workers/task-worker";

const router = express.Router()
const taskQueue = new Queue(config.taskQueueName, { connection: config.connection, defaultJobOptions: { removeOnComplete: true, removeOnFail: 500, } });

router.post('/send-email', [checkSendEmailSchema, timeConversion, encryptBody], async (req: Request<any, any, SendMailRequestBody & { encrypted: EncryptedResult } & { delayInMs?: number }, any>, res: any) => {
    const targetEmail = req.body.email
    const encryptedText = req.body.encrypted
    const delayInMs = req.body.delayInMs
    const webhookCallbackUrl = req.body.callback_url
    const webhookCallbackData = req.body.callback_data
    const webhookCallbackMethod = req.body.method

    const customJobId = uuidv4()
    const customMailJobId = uuidv4()

    taskQueue
        .add(
            targetEmail,
            {
                customJobId,
                customMailJobId,
                delayInMs,
                encrypted: encryptedText,
                webhookCallbackUrl,
                webhookCallbackData,
                webhookCallbackMethod
            })
        .then(
            (job) => {

                if (delayInMs) {
                    res.status(201).json({
                        msg: "Success",
                        cancelID: customJobId,
                        rescheduleID: customMailJobId,
                    })
                }

                else {
                    res.status(201).json({
                        msg: "Success",
                    })
                }

            },
            (err) => {
                console.error("Client server err", err)
                res.status(500).end(`Something went wrong on this servcie: ${err}`)
            }
        )
});

router.put('/reschedule-email/:rescheduleID', timeConversion, async (req, res) => {
    try {
        const mailID = req.params.rescheduleID
        const delayInMs = req.body.delayInMs

        if (!mailID) {
            throw new InvalidJobIdError('Job ID not found in request parameter')
        }

        const job = await mailQueue.getJob(mailID)

        if (!job) throw new InvalidJobIdError("Cannot find matched result with this ID.")

        await job.changeDelay(delayInMs)

        return res.status(200).json({
            msg: `Reschedule email to ${req.body.send_at} successfully.`
        })

    } catch (error) {
        if (error instanceof InvalidJobIdError) {
            return res.status(500).json({ msg: `Invalid ID: ${error}` })
        } else {
            return res.status(500).json({ msg: `Unable to reschedule email.` })
        }
    }
})

router.delete('/cancel-email/:cancelID', async (req, res) => {
    try {
        const jobId = req.params.cancelID

        if (!jobId) {
            throw new InvalidJobIdError('Job ID not found in request parameter')
        }

        const job = await webhooksQueue.getJob(jobId)

        if (!job) throw new InvalidJobIdError("Cannot find matched result with this ID.")

        job.remove()
            .catch((e: any) => {
                throw new CancelJobError(`Cannot cancel email: ${e}`)
            })

        return res.status(200).json({
            msg: "Removed email successfully."
        })

    } catch (error) {
        if (error instanceof InvalidJobIdError) {
            return res.status(500).json({ msg: `Invalid ID: ${error}` })
        } else if (error instanceof CancelJobError) {
            return res.status(500).json({ msg: `Unable to cancel email: ${error}` })
        } else {
            return res.status(500).json({ msg: `Unable to cancel email.` })
        }
    }
})

export default router