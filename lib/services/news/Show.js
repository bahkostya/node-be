import mongoose     from 'mongoose';
import Base         from 'service-layer/Base';
import { dumpNews } from '../utils.js';

const News = mongoose.model('News');

export default class Show extends Base {
    static validationRules = {
        id : ['required', 'object_id']
    };

    async execute(data) {
        const news = await News.findById(data.id);

        return {
            data : dumpNews(news)
        };
    }
}
