import {Queue} from "bullmq";

export interface MessageQueuePort {
    getQueue(queueName: string): Queue;

}