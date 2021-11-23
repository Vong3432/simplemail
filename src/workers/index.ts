import { Job, QueueScheduler } from "bullmq";
import config from "../config";
import { worker } from "./mail-worker"
import { taskWorker } from "./task-worker";
import { webhooksWorker } from "./webhook-worker";

const taskQueueScheduler = new QueueScheduler(config.taskQueueName, {
    connection: config.connection,
});

const mailQueueScheduler = new QueueScheduler(config.queueName, {
    connection: config.connection,
});

const webhookQueueScheduler = new QueueScheduler(config.webhookQueueName, {
    connection: config.connection,
});

console.log(`Started workers: ${webhooksWorker.name} and ${taskWorker.name}`);

worker.on("completed", (job: Job) => {
    console.log(`Completed job ${job.id} successfully`)
})

worker.on("failed", (job, err) => {
    console.log(`Failed job ${job.id} with ${err}`)
})

worker.on('error', err => {
    // log the error
    console.error(err);
});