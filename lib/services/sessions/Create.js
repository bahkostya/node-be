import jwt          from 'jsonwebtoken';
import Base         from 'service-layer/Base';
import X            from 'service-layer/Exception';
import mongoose     from '../../mongoose';
import { dumpUser } from '../utils';

import { secret }   from '../../../etc/config.json';

const User = mongoose.model('User');

export default class Create extends Base {
    static validationRules = {
        data : ['required', { 'nested_object' : {
            password : [ 'required' ],
            email    : ['required', 'email']
        } } ]
    };

    async execute(data) {
        const session = data.data;
        const existingUser = await User.findOne({ email: session.email });

        if (!existingUser || !existingUser.checkPassword(session.password)) {
            throw new X({
                code   : 'AUTHENTICATION_FAILED',
                fields : {
                    email    : 'INVALID',
                    password : 'INVALID'
                }
            });
        }

        if (existingUser.status === 'BLOCKED') {
            throw new X({
                code   : 'NOT_ACTIVE_USER',
                fields : {
                    status : 'NOT_ACTIVE_USER'
                }
            });
        }

        return {
            data : {
                jwt : jwt.sign(dumpUser(existingUser), secret)
            }
        };
    }
}
