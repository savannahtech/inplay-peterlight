export const BGWorkerEventsHandler = (worker: any) => {
    worker.on('completed', (job: any) => {
        console.log(`Worker ${worker.name} : job ${job.id} has been completed!`);
    });

    worker.on('failed', (job: any, err: Error) => {
        console.error(`Worker ${worker.name} :  job ${job.id} has failed with error: ${err.message}`);
    });
}