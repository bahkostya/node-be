import path               from 'path';
import fsExtra            from 'fs-extra';
import { promisifyAll }   from 'bluebird';
import mongoose           from '../../lib/mongoose';
import { testStaticPath } from '../../etc/config.json';

const fs = promisifyAll(fsExtra);

const fixturesPath = 'tests/api/fixtures';

const User = mongoose.model('User');
const News = mongoose.model('News');

const STATE_IS_CONNECTED = 1;

export default class TestFactory {
    constructor() {
        // Additonal protection against running test on production db
        const dbName = mongoose.connections[0].name;

        if (!dbName.match(/test/i)) {
            throw new Error(`DATABASE [${dbName}] DOES NOT HAVE "test" IN ITS NAME`);
        }
    }

    createUser(data) {
        return new User(data).save();
    }

    async login(request) {
        return new Promise((resolve) => {
            request
                .post('/api/v1/sessions')
                .send({ 'data': { email: 'admin1@gmail.com', password: 'password1' } })
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }
                    resolve(res.body.data.jwt);
                });
        });
    }

    async setDefaultUsers() {
        const users = [
            {
                email    : 'admin1@gmail.com',
                password : 'password1',
                status   : 'ACTIVE'
            },
            {
                email    : 'admin2@gmail.com',
                password : 'password2',
                status   : 'BLOCKED'
            }
        ];

        const promises = users.map(usersItem => {
            return new User(usersItem).save();
        });

        return Promise.all(promises);
    }

    async setDefaultNews() {
        const news = [
            {
                title    : 'Title',
                subtitle : 'Subtitle',
                text     : 'Text'
            },
            {
                title    : 'Title2',
                subtitle : 'Subtitle2',
                text     : 'Text2'
            },
            {
                title    : 'Title3',
                subtitle : 'Subtitle3',
                text     : 'Text3'
            }
        ];

        const promises = news.map(newsItem => {
            return new News(newsItem).save();
        });

        return Promise.all(promises);
    }

    cleanup() {
        if (mongoose.connection.readyState === STATE_IS_CONNECTED) {
            return this._dropDatabase();
        }

        return new Promise((resolve, reject) => {
            mongoose.connection.once('connected', () => {
                /* eslint-disable more/no-then */
                this._dropDatabase().then(resolve).catch(reject);
            });
        });
    }

    createStaticFolder() {
        return fs.mkdirsAsync(testStaticPath);
    }

    removeStaticFolder() {
        return fs.removeAsync(testStaticPath);
    }

    createFixture(name, size) {
        const target = path.join(fixturesPath, name);

        return fs.writeFileAsync(target, new Buffer(size));
    }

    removeFixture(name) {
        const target = path.join(fixturesPath, name);

        return fs.removeAsync(target);
    }

    _dropDatabase() {
        return new Promise((resolve, reject) => {
            mongoose.connection.db.dropDatabase(err => {
                if (err) {
                    return reject(err);
                }

                return resolve();
            });
        });
    }

    setIndex(collectionName) {
        if (mongoose.connection.readyState === STATE_IS_CONNECTED) {
            return this._ensureIndex(collectionName);
        }

        return new Promise((resolve, reject) => {
            mongoose.connection.once('connected', () => {
                /* eslint-disable more/no-then */
                this._ensureIndex(collectionName).then(resolve).catch(reject);
            });
        });
    }

    _ensureIndex(collectionName) {
        return new Promise((resolve, reject) => {
            mongoose.connection.collections[collectionName].ensureIndex(
                { searchField: 'text' },
                err => {
                    if (err) {
                        return reject(err);
                    }

                    return resolve();
                }
            );
        });
    }
}
