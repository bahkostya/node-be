import mongoose from 'mongoose';
import Base     from 'service-layer/Base';

const News = mongoose.model('News');

export default class Create extends Base {
    static validationRules = {
        id : [ 'required' ]
    };

    async execute(data) {
        const news = await News.findById(data.id);

        await news.remove();

        return {};
    }
}
