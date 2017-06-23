import mongoose   from 'mongoose';
import timestamps from 'mongoose-timestamp';
import uuid       from 'uuid';

const Schema = mongoose.Schema;

const ActionSchema = new Schema({
    // Important. Select UUID.v4 for generate id, because unlike ObjectId is not predictable
    _id  : { type: String, default: uuid.v4 },
    type : { type: String, required: true, enum: ['confirmEmail', 'resetPassword'] },
    data : { type: Object, required: true, default: {} }
});

ActionSchema.plugin(timestamps);

ActionSchema.methods = {
    run(data) {
        return this[this.type](data);
    },

    async confirmEmail(externalData) {
        const User = mongoose.model('User');
        const user = await User.findOne({ actionId: externalData.id });

        user.status = 'ACTIVE';

        return user.save();
    },

    async resetPassword(externalData) {
        const User = mongoose.model('User');

        const user = await User.findById(this.data.userId);

        user.password = externalData.password;

        return user.save();
    }
};

ActionSchema.post('save', (externalAction) => {
    process.env.LAST_ACTION_ID = externalAction.id; // For testing
});

mongoose.model('Action', ActionSchema);
