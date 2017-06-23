import mongoose     from 'mongoose';
import Base         from 'service-layer/Base';
import { dumpNews } from '../utils.js';

const News = mongoose.model('News');

export default class Update extends Base {
    static validationRules = {
        id   : [ 'required' ],
        data : ['required', { 'nested_object' : {
            title       : [ 'not_empty' ],
            subtitle    : [ 'not_empty' ],
            image       : [ 'url' ],
            text        : [ 'not_empty' ],
            isPublished : [ 'not_empty' ]
        } } ]
    };

    async execute(data) {
        let news = await News.findById(data.id);

        news = await this._updateNews(news, data.data);

        return {
            data : dumpNews(news)
        };
    }

    async _updateNews(news, data) {
        const newsForUpdate = news;

        Object.keys(data).forEach(key => {
            newsForUpdate[key] = data[key];
        });

        await newsForUpdate.save();

        return newsForUpdate;
    }
}
