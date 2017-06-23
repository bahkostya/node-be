import mongoose from 'mongoose';
import bluebird from 'bluebird';
import X        from 'service-layer/Exception'; // Not the best solution to import service X in Model layer
import config   from '../etc/config.json';

import './models/Actions';
import './models/User';
import './models/News';

const dbPort = config.db.port;
const dbHost = process.env.TEST_MODE && process.env.TEST_MONGO_HOST
                ? process.env.TEST_MONGO_HOST
                : config.db.host;

const dbName = process.env.TEST_MODE ? config.db.testName : config.db.name;

mongoose.Promise = bluebird;
mongoose.connect(`mongodb://${dbHost}:${dbPort}/${(dbName)}`);

mongoose.Model.findById = async function findById(id) {
    const exception = new X({
        code   : 'WRONG_ID',
        fields : { id: 'WRONG_ID' }
    });

    /* istanbul ignore next */
    if (!id) throw exception;

    const doc = await this.findOne({ _id: id });

    if (!doc) throw exception;

    return doc;
};

export default mongoose;
