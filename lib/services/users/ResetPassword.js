import Base         from 'service-layer/Base';
import X            from 'service-layer/Exception';
import emailSender from '../emailSender';
import mongoose    from '../../mongoose';

const User   = mongoose.model('User');
const Action = mongoose.model('Action');

export default class ResetPassword extends Base {
    static validationRules = {
        data : { 'nested_object' : {
            email : ['required', 'email']
        } }
    };

    async execute(data) {
        const userData = data.data;
        const user = await User.findOne({ email: userData.email });

        if (!user) {
            throw new X({
                code   : 'NOT_FOUND',
                fields : {
                    email : 'NOT_FOUND'
                }
            });
        }

        if (user.status === 'BLOCKED') {
            throw new X({
                code   : 'BLOCKED_USER',
                fields : {
                    email : 'BLOCKED_USER'
                }
            });
        }

        const action = await new Action({
            type : 'resetPassword',
            data : {
                userId : user.id,
                email  : user.email
            }
        }).save();

        user.actionId = action.id;
        await user.save();

        emailSender.send('resetPassword', user.email, user);

        return {};
    }
}
