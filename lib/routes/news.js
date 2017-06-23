import { makeServiceRunner }  from '../expressServiceRunning';

export default {
    create : makeServiceRunner('news/Create', req => req.body),
    update : makeServiceRunner('news/Update', req => ({ ...req.body, id: req.params.id })),
    delete : makeServiceRunner('news/Delete', req => ({ id: req.params.id })),
    list   : makeServiceRunner('news/List',   req => req.query),
    show   : makeServiceRunner('news/Show',   req => ({ id: req.params.id }))
};
