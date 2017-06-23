
import { makeServiceRunner }  from '../expressServiceRunning';

export default {
    create : makeServiceRunner('images/Create', req => req.files)
};
