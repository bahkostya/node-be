/* eslint max-params:0 */

import util      from 'util';
import logger    from 'bunyan-singletone-facade';
import Exception from 'service-layer/Exception';

function cloneDeep(data) {
    return JSON.parse(JSON.stringify(data));
}

function log({ type, actionName, params, result, startTime, userId }) {
    logger[type]({
        service : actionName,
        runtime : Date.now() - startTime,
        params,
        result,
        userId
    });
}

export default function (services) {
    async function runService(actionName, { session, params = {} }) {
        const [actionGroup, actionClass] = actionName.split('/');
        const startTime  = Date.now();
        const context = cloneDeep(session && session.context ? session.context : {});

        try {
            const result = await new services[actionGroup][actionClass]({
                context
            }).run(params);

            log({
                type   : 'info',
                actionName,
                params : util.inspect(params, { showHidden: false, depth: null }),
                result : JSON.stringify(result),
                startTime
            });

            return result;
        } catch (error) {
            log({
                type   : (error instanceof Exception ? 'info' : 'error'),
                actionName,
                params,
                result : error,
                startTime
            });

            throw error;
        }
    }

    function makeServiceRunner(actionName, paramsCollector) {
        return function serviceRunner(req, res) {
            const params = paramsCollector ? paramsCollector(req, res) : {};

            const resultPromise = runService(actionName, {
                params,
                session : req.session
            });

            return renderPromiseAsJson(req, res, resultPromise);
        };
    }

    async function renderPromiseAsJson(req, res, promise) {
        try {
            const data = await promise;

            data.status = 1;

            return res.send(data);
        } catch (error) {
            /* istanbul ignore next */
            if (error instanceof Exception) {
                res.send({
                    status : 0,
                    error  : error.toHash()
                });
            } else {
                console.error('REQUEST URL ', req.url);
                console.error('REQUEST PARAMS: ', req.params);
                console.error('REQUEST BODY: ', req.body);
                console.error('ERROR: ', error.stack);
                console.error('-------------------');

                res.send({
                    status : 0,
                    error  : {
                        code    : 'UNKNOWN_ERROR',
                        message : 'Please, contact your system administartor!'
                    }
                });
            }
        }
    }

    return {
        makeServiceRunner,
        runService,
        renderPromiseAsJson
    };
}
