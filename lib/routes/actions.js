import { makeServiceRunner }  from '../expressServiceRunning';

export default {
    submit : makeServiceRunner('actions/Submit', req => ({ ...(req.body.data || {}), id: req.params.id }))
};
