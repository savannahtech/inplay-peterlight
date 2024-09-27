export class ObjectsHelpers {
    static extractAttributesToData(object_: Object): Object {
        const data_ = {}
        for (const [key, value] of Object.entries(object_)) {
            if (value !== null && value !== undefined) {
                data_[key as keyof Object] = value;
            }
        }
        return data_;
    }
}