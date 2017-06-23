import { makeServiceRunner, runService }  from '../expressServiceRunning';

export default {
    create : makeServiceRunner('sessions/Create', req => req.body),

    async check(req, res, next) {
        const userData = await runService('sessions/Check', {
            params : {
                token : req.query.token
            }
        });

        /* eslint no-param-reassign: 0 */
        req.session = {
            context : {
                userId     : userData.id,
                userStatus : userData.status
            }
        };

        return next();
    }
};
