import mongoose     from 'mongoose';
import Base         from 'service-layer/Base';
import { dumpNews } from '../utils.js';

const News = mongoose.model('News');

export default class Create extends Base {
    static validationRules = {
        data : ['required', { 'nested_object' : {
            title       : [ 'required' ],
            subtitle    : [ 'required' ],
            image       : ['not_empty', 'url'],
            text        : [ 'required' ],
            isPublished : [ 'not_empty' ]
        } } ]
    };

    async execute(data) {
        const news = await News.create(data.data);

        return {
            data : dumpNews(news)
        };
    }
}
