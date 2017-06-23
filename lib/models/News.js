import mongoose   from 'mongoose';
import timestamps from 'mongoose-timestamp';


const Schema = mongoose.Schema;

const NewsSchema = new Schema({
    title       : { type: String, required: true },
    subtitle    : { type: String, required: true },
    text        : { type: String, required: true },
    image       : { type: String, default: '' },
    isPublished : { type: Boolean, default: false }
});

NewsSchema.plugin(timestamps);

mongoose.model('News', NewsSchema);
