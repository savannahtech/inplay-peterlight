import {BaseFilterFields, FilterFieldsOperation} from "./fields";

export class FilterHelperUtils {
    static getProcessedFieldNameAndOperation(raw_field_name: string) {
        if (raw_field_name?.includes('__')) {
            const [fieldName, operation] = raw_field_name.split('__')
            if (Object.values(FilterFieldsOperation).includes(operation as FilterFieldsOperation)) {
                return [fieldName, operation]
            }
        }
        return [raw_field_name, FilterFieldsOperation.EQ];
    }

    static processQueryFilter(query_input: { [key: string]: string }, fieldsSpecification: { [key: string]: BaseFilterFields }) {
        const filterParams: any = {}
        for (let [field_name, field_value] of Object.entries(query_input)) {
            const res = this.getProcessedFieldNameAndOperation(field_name)
            if (res) {
                const [fieldName, operation] = res;
                const matchingFieldSpec = fieldsSpecification[fieldName]
                if (matchingFieldSpec) {
                    // @ts-ignore
                    const newParam: BaseFilterFields = new matchingFieldSpec({
                        field_name: fieldName,
                        field_operation: operation,
                        raw_field_value: field_value
                    }).filterParam
                    if (newParam) {
                        if (!filterParams[fieldName]) {
                            filterParams[fieldName] = {}
                        }
                        Object.assign(filterParams[fieldName], newParam)
                    }
                }
            }
        }
        return filterParams
    }
}