Math.floor(Date.now() / 1000);

export class DateTimeHelpers {
    static currentTimeInSecs(): number {
        return Math.floor(Date.now() / 1000);
    }

    static computeSecondsBetweenStartEndTime(startTime: Date | string, endTime?: Date): number {
        if (typeof startTime === "string") {
            startTime = new Date(startTime)
        }
        if (!endTime) {
            // @ts-ignore
            endTime = new Date()
        }
        // Calculate the difference in seconds
        // @ts-ignore
        return Math.floor((endTime - startTime) / 1000);
    }
}