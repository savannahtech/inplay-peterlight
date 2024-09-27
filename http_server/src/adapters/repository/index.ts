import {Document, Model} from 'mongoose';
import CoreExceptionModelItemNotFoundException from "../../core/exception";

export class BaseRepository<T extends Document> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    private applyProjection(query: any, projection: string[] | null) {
        if (projection) {
            projection.forEach((item) => {
                query = query.populate(item)
            })
        }
        return query
    }

    async create(item: any) {
        return await new this.model(item).save();
    }

    async fetchMultiple(where?: { [key: string]: any }, order_by?: { [key: string]: 1 | -1 }, projection: null | string[] = null) {
        return await this.applyProjection(this.model.find(where as Record<string, any>).sort(order_by), projection).exec();
    }

    async fetchSingle(where: { [key: string]: any }, failSilently = false, projection: null | string[] = null) {
        const item = await this.applyProjection(this.model.findOne(where as Record<string, any>), projection).lean().exec();
        if (!item && !failSilently) {
            throw new CoreExceptionModelItemNotFoundException({modelName: this.model.modelName})
        }
        return item
    }

    async update(where: { [key: string]: any }, item: any, failSilently = false) {
        const result = await this.model.findOneAndUpdate(where as Record<string, any>, item, {new: true}).exec();
        if (!result && !failSilently) {
            throw new CoreExceptionModelItemNotFoundException({modelName: this.model.modelName})
        }
        return result
    }

    async delete(where: { [key: string]: any }, failSilently = false) {
        const item = await this.model.findOneAndDelete(where as Record<string, any>).exec();
        if (!item && !failSilently) {
            throw new CoreExceptionModelItemNotFoundException({modelName: this.model.modelName})
        }
        return item
    }
}
