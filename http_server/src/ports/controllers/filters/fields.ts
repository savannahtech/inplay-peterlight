export enum FilterFieldsOperation {
    GTE = "gte",
    LTE = "lte",
    GT = "gt",
    LT = "lt",
    EQ = "eq",
    NOT_EQ = "ne",
    IN = "in",
    NOT_IN = "nin"
}

export enum FilterFieldsListOperation {
    IN = "in",
    NOT_IN = "nin"
}


type BaseFilterFieldParamsType = {
    field_name: string,
    field_operation: string,
    raw_field_value: any,
    operations?: FilterFieldsOperation[]
}

export class BaseFilterFields {
    protected field_name?: string;
    protected field_operation?: string;
    protected operations?: FilterFieldsOperation[] = [
        FilterFieldsOperation.EQ,
        FilterFieldsOperation.NOT_EQ,
        FilterFieldsOperation.GTE,
        FilterFieldsOperation.LTE,
        FilterFieldsOperation.GT,
        FilterFieldsOperation.LT,
        FilterFieldsOperation.IN,
        FilterFieldsOperation.NOT_IN
    ]
    protected raw_field_value?: string


    constructor(params: BaseFilterFieldParamsType) {
        Object.assign(this, params)
    }

    protected getProcessedFieldNameAndOperation() {
        // @ts-ignore
        if (this.operations.includes(this.field_operation as FilterFieldsOperation)) {
            return [this.field_name, this.field_operation]
        }
    }

    get filterParam(): [string, { [key: string]: any }] | void {
        const res = this.getProcessedFieldNameAndOperation();
        if (res) {
            const [fieldName, fieldOperation] = res;
            // @ts-ignore
            const fieldValue = this.getProcessedValue(fieldOperation)
            const param_: any = {}
            param_[`$${fieldOperation}`] = fieldValue
            return param_
        }
    }


}

export class StringFilterField extends BaseFilterFields {
    operations = [
        FilterFieldsOperation.EQ,
        FilterFieldsOperation.NOT_EQ,
        FilterFieldsOperation.IN,
        FilterFieldsOperation.NOT_IN
    ]

    protected getProcessedValue(operation?: string) {
        // @ts-ignore
        if (operation && (Object.values(FilterFieldsListOperation).includes(operation))) {
            // @ts-ignore
            return this.raw_field_value.split(',')
        }
        return this.raw_field_value
    }
}

export class BooleanFilterField extends BaseFilterFields {
    operations = [
        FilterFieldsOperation.EQ,
        FilterFieldsOperation.NOT_EQ,
        FilterFieldsOperation.IN,
        FilterFieldsOperation.NOT_IN
    ]

    protected getProcessedValue(operation?: string) {
        // @ts-ignore
        if (operation && (Object.values(FilterFieldsListOperation).includes(operation))) {
            // @ts-ignore
            return this.raw_field_value.split(',').map((item) => !!(item))
        }
        return this.raw_field_value
    }
}

export class NumberFilterField extends BaseFilterFields {

    protected getProcessedValue(operation?: string) {
        // @ts-ignore
        if (operation && (Object.values(FilterFieldsListOperation).includes(operation))) {
            // @ts-ignore
            return this.raw_field_value.split(',').map((item) => Number.parseInt(item as string))
        }
        return Number.parseInt(this.raw_field_value as string)
    }
}


export class DateTimeFilterField extends BaseFilterFields {
    operations = [
        FilterFieldsOperation.EQ,
        FilterFieldsOperation.NOT_EQ,
        FilterFieldsOperation.GTE,
        FilterFieldsOperation.LTE,
        FilterFieldsOperation.GT,
        FilterFieldsOperation.LT,
    ]

    protected getProcessedValue(operation?: string) {
        // @ts-ignore
        if (operation && (Object.values(FilterFieldsListOperation).includes(operation))) {
            // @ts-ignore
            return this.raw_field_value.split(',').map((item) => new Date(item as string))
        }
        return new Date(this.raw_field_value as string)
    }
}