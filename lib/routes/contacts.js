import { makeServiceRunner }  from '../expressServiceRunning';

export default {
    send : makeServiceRunner('contacts/Send', req => req.body)
};
