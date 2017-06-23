import Base         from 'service-layer/Base';
import X            from 'service-layer/Exception';
import { dumpUser } from '../utils';
import mongoose     from '../../mongoose';
import emailSender  from '../emailSender';

const User   = mongoose.model('User');
const Action = mongoose.model('Action');

export default class Create extends Base {
    static validationRules = {
        data : ['required', { 'nested_object' : {
            email    : ['required', 'email'],
            password : 'required'
        } } ]
    };

    async execute(data) {
        const userData = data.data;

        if (await User.findOne({ email: userData.email })) {
            throw new X({
                code   : 'NOT_UNIQUE',
                fields : {
                    email : 'NOT_UNIQUE'
                }
            });
        }

        const action = await new Action({
            type : 'confirmEmail',
            data : {
                email : userData.email
            }
        }).save();

        userData.actionId = action.id;

        const user = new User(userData);

        await user.save();
        await emailSender.send('confirmEmail', userData.email, userData);

        return {
            data : dumpUser(user)
        };
    }
}
