import {Queue} from "bullmq";

export interface MessageQueuePort {
    getQueue(queueName: string): Queue;

    addJobToQueue(queue: Queue, jobName: string, data: any, delay?: number, jobId?: string): Promise<void>;
}
