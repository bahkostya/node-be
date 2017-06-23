import { makeServiceRunner }  from '../expressServiceRunning';

export default {
    create        : makeServiceRunner('users/Create', req => req.body),
    update        : makeServiceRunner('users/Update', req => ({ ...req.body, id: req.params.id })),
    resetPassword : makeServiceRunner('users/ResetPassword', req => req.body),
    list          : makeServiceRunner('users/List', req => req.query),
    show          : makeServiceRunner('users/Show', req  => ({ id: req.params.id }))
};
