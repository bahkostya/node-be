import Base         from 'service-layer/Base';
import X            from 'service-layer/Exception';
import mongoose     from '../../mongoose';
import { dumpUser } from '../utils';

const User = mongoose.model('User');

export default class Update extends Base {
    static validationRules = {
        id   : ['required', 'object_id'],
        data : { 'nested_object' : {
            language    : { 'one_of': ['en', 'ru', 'ua'] },
            companyName : [ { 'min_length': 2 }, { 'max_length': 50 } ],
            firstName   : [ { 'min_length': 2 }, { 'max_length': 50 } ],
            secondName  : [ { 'min_length': 2 }, { 'max_length': 50 } ],
            position    : [ { 'min_length': 2 }, { 'max_length': 50 } ]
        } }
    };

    async execute(data) {
        const userData = data.data;
        const user = await User.findById(data.id);

        if (data.id !== this.context.userId) {
            throw new X({
                code   : 'WRONG_ID',
                fields : {
                    id : 'WRONG_ID'
                }
            });
        }

        user.firstName = userData.firstName;
        user.secondName = userData.secondName;

        return dumpUser(await user.save());
    }
}
