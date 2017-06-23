import Base         from 'service-layer/Base';
import mongoose     from '../../mongoose';
import { dumpUser } from '../utils.js';

const User = mongoose.model('User');

export default class List extends Base {
    static validationRules = {
        firstName  : [ { 'min_length': 2 } ],
        secondName : [ { 'min_length': 2 } ],
        email      : [ { 'min_length': 2 } ],
        search     : [ { 'min_length': 2 } ],
        limit      : [ 'positive_integer' ],
        offset     : ['integer', { 'min_number': 0 } ],
        sort       : [ { 'one_of': ['id', 'firstName', 'secondName', 'email'] } ],
        order      : [ { 'one_of': ['ASC', 'DESC'] } ]
    };

    async execute(params) {
        const limit = +params.limit || 20;
        const offset = +params.offset || 0;
        const search = new RegExp(params.search || '', 'g');
        const findQuery = { $or: [ { firstName: search }, { secondName: search }, { position: search } ] };

        const [users, filteredCount, totalCount] = await Promise.all([
            User.find(findQuery).limit(limit).skip(offset),
            User.count(findQuery),
            User.count()
        ]);

        const data = users.map(dumpUser);

        return {
            data,
            meta : {
                totalCount,
                filteredCount,
                limit,
                offset
            }
        };
    }

    _buildWhereCondition(filters) {
        const searchFields = ['firstName', 'secondName', 'email'];

        const searchCondition = { $or: [] };

        if (filters.search) {
            searchFields.forEach((columnName) => {
                const simpleCondition = {};

                simpleCondition[columnName] = { $iLike: `%${filters.search}%` };
                searchCondition.$or.push(simpleCondition);
            });
        }

        return searchCondition;
    }
}
