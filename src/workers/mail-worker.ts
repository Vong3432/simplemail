import { Worker } from "bullmq";
import config from "../config";

export const worker = new Worker(config.queueName, config.processorPath + "/mail-processors.js", {
    connection: config.connection,
    concurrency: config.concurrency
})