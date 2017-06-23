import mongoose     from 'mongoose';
import Base         from 'service-layer/Base';
import { dumpNews } from '../utils.js';

const News = mongoose.model('News');

export default class List extends Base {
    static validationRules = {
        limit  : [ 'positive_integer' ],
        offset : [ 'positive_integer' ],
        sort   : [ { 'one_of': ['id', 'createdAt'] } ],
        order  : [ { 'one_of': ['ASC', 'DESC'] } ]
    };

    async execute(params) {
        const limit  = +params.limit || 20;
        const offset = +params.offset || 0;
        const search = new RegExp(params.search || '', 'g');
        const findQuery = { $or: [ { title: search }, { subtitle: search } ] };

        const [news, filteredCount, totalCount] = await Promise.all([
            News.find(findQuery).limit(limit).skip(offset),
            News.count(findQuery),
            News.count()
        ]);

        const data = news.map(dumpNews);

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
}
