import mongoose     from 'mongoose';
import timestamps   from 'mongoose-timestamp';
import userPassword from 'mongoose-user-password';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email      : { type: String, required: true, index: { unique: true } },
    status     : { type: String, enum: ['ACTIVE', 'BLOCKED', 'PENDING'], default: 'PENDING' },
    actionId   : { type: String, default: '' },
    firstName  : { type: String, default: '' },
    secondName : { type: String, default: '' }
});

UserSchema.plugin(timestamps);
UserSchema.plugin(userPassword);

mongoose.model('User', UserSchema);
