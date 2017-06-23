import Base        from 'service-layer/Base';
import emailSender from '../emailSender';
import config      from '../../../etc/config.json';

export default class ResetPassword extends Base {
    static validationRules = {
        data : { 'nested_object' : {
            email       : ['required', 'email'],
            name        : [ 'required' ],
            phoneNumber : { 'max_length': 10 },
            website     : [ 'url' ],
            solution    : [ 'not_empty' ],
            timeframe   : [ 'not_empty' ],
            additional  : [ 'not_empty' ]
        } }
    };

    async execute(data) {
        emailSender.send('contact', config.contactEmail, data.data);

        return {};
    }
}
