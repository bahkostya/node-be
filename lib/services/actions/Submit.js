import jwt          from 'jsonwebtoken';
import Base         from 'service-layer/Base';

import { dumpUser } from '../utils';
import mongoose     from '../../mongoose';
import { secret }   from '../../../etc/config.json';

const Action = mongoose.model('Action');

export default class Submit extends Base {
    async validate(data) {
        const action = await Action.findById(data.id);

        const rulesRegistry = {
            resetPassword : {
                password        : 'required',
                confirmPassword : ['required', { 'equal_to_field': [ 'password' ] } ]
            },

            confirmEmail : {}
        };

        return this.doValidation(data, {
            ...rulesRegistry[action.type],
            id : ['required', 'object_id']
        });
    }

    async execute(data) {
        const action = await Action.findById(data.id);
        const result = await action.run(data);

        await action.remove();

        /* istanbul ignore else */
        if (action.type === 'resetPassword') {
            return { data: dumpUser(result) };
        } else if (action.type === 'confirmEmail') {
            return { jwt: jwt.sign(action, secret) };
        }

        return {};
    }
}
