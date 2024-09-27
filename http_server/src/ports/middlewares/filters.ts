import {NextFunction, Request, Response} from 'express'
import {FilterHelperUtils} from "../controllers/filters";


const parseCommaSeparatedFieldValues = (data: string, considersep?: boolean) => {
    const filterParamArray = data.split(',')
    const filterObject: {
        [index: string]: any
    } = {}
    for (let filterParam of filterParamArray) {
        const [filterField, filterValue] = filterParam.split('=')
        if (considersep && filterField.includes('.')) {
            const sepfilterField = filterField.split('.')
            filterObject[sepfilterField[0]] = {}
            filterObject[sepfilterField[0]][sepfilterField[1]] = filterValue
        } else {
            filterObject[filterField] = filterValue;
        }
    }
    return filterObject
}

class RequestQueryParserFilterFieldsHelper {
    static formatSearchFields(query_input: string, fieldSpecifications: string[]) {
        return {
            $or: fieldSpecifications.map((field) => {
                let item_: any = {}
                item_[field] = {$regex: query_input, $options: 'i'}
                return item_
            })
        }
    }

    static formatOrderingFields(query_input: string, fieldSpecifications: string[]) {
        const formattedResponse: { [key: string]: 1 | -1 } = {}
        for (let item of query_input.split(',')) {
            item = item.trim()
            if (item.startsWith('-')) {
                if (fieldSpecifications.includes(item.substring(1))) {
                    formattedResponse[item.substring(1)] = -1
                }
            } else {
                if (fieldSpecifications.includes(item)) {
                    formattedResponse[item] = 1
                }
            }
        }
        return formattedResponse
    }

    static formatExpansionFields(query_input: string, fieldSpecifications: string[]) {
        const formattedResponse: string[] = []
        for (let item of query_input.split(',')) {
            item = item.trim()
            if (fieldSpecifications.includes(item)) {
                formattedResponse.push(item)
            }

        }
        return formattedResponse
    }

    static formatFilterFields(query_input: { [key: string]: string }, fieldSpecifications: any) {
        return FilterHelperUtils.processQueryFilter(query_input, fieldSpecifications)
    }


}

type filtersParserFromQueryParamsMiddlewareParams = {
    filterFields: any,
    searchFields: any,
    orderingFields: any,
    expansionFields?: any
}

// @ts-ignore
export const filtersParserFromQueryParamsMiddleware = ({filterFields, searchFields, orderingFields, expansionFields}: filtersParserFromQueryParamsMiddlewareParams) => ((req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (req.query.ordering) {
        // @ts-ignore
        req._ordering = RequestQueryParserFilterFieldsHelper.formatOrderingFields(req.query.ordering, orderingFields)
        // @ts-ignore
        delete req.query.ordering
    }
    // @ts-ignore
    if (req.query.expansion) {
        // @ts-ignore
        req._expansion = RequestQueryParserFilterFieldsHelper.formatExpansionFields(req.query.expansion, expansionFields)
        // @ts-ignore
        delete req.query.expansion
    }
    // @ts-ignore
    if (req.query.search) {
        // @ts-ignore
        req._search = RequestQueryParserFilterFieldsHelper.formatSearchFields(req.query.search, searchFields)
        // @ts-ignore
        delete req.query.search
    }
    // @ts-ignore
    if (req.query) {
        // @ts-ignore
        req._filter = RequestQueryParserFilterFieldsHelper.formatFilterFields(req.query, filterFields)
    }
    next()
})

