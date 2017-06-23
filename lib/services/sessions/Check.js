import { promisify } from 'bluebird';
import jwt           from 'jsonwebtoken';
import Base          from 'service-layer/Base';
import X             from 'service-layer/Exception';
import { secret }    from '../../../etc/config.json';
import mongoose      from '../../mongoose';

const User = mongoose.model('User');

const jwtVerify = promisify(jwt.verify);

export default class Check extends Base {
    static validationRules = {
        token : [ 'required' ]
    };

    async execute({ token }) {
        const userData = await jwtVerify(token, secret);

        const isValid = await User.findOne({ _id: userData.id, status: 'ACTIVE' });

        if (!isValid) {
            throw new X({
                code   : 'WRONG_TOKEN',
                fields : {
                    token : 'WRONG_TOKEN'
                }
            });
        }

        return jwtVerify(token, secret);
    }
}
