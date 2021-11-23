import { Queue } from 'bullmq';
import express, { Request } from 'express'
import { Method } from 'got/dist/source';
import config from './config';
import checkSendEmailSchema from './middlewares/send-email-schema-check';

const app = express();
const port = process.env.PORT || 5003;

app.use(express.json());
app.set('trust proxy', true)

const taskQueue = new Queue(config.taskQueueName, { connection: config.connection });

app.post('/send-email', checkSendEmailSchema, async (req: Request, res: any) => {
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


app.listen(port, () => {
    return console.log(`server is listening on ${port}`);
});

export default app