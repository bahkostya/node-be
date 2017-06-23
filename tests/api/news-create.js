import { assert }  from 'chai';
import supertest   from 'supertest';
import jwt         from 'jsonwebtoken';

import app             from '../../app';
import config from '../../etc/config.json';
import TestFactory     from './TestFactory';

const secret  = config.secret;
const factory = new TestFactory();
const request = supertest.agent(app);

let token;
let newsId;

suite('News Create');

before(async () => {
    await factory.cleanup();
    await factory.setDefaultUsers();

    const news = await factory.setDefaultNews();

    newsId = news[0]._id;
    token = await factory.login(request);
});

test('Positive: create news', done => {
    request
        .post(`/api/v1/news?token=${token}`)
        .send({ data : {
            title    : 'Title',
            subtitle : 'Subtitle',
            text     : 'Text'
        } })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.ok(res.body.status);
            jwt.verify(res.body.data.jwt, secret, (err, decoded) => {
                const decodetResp = decoded;

                if (err) {
                    throw err;
                }

                delete decodetResp.createdAt;

                assert.deepEqual(decodetResp, {
                    id          : newsId,
                    title       : 'Title',
                    subtitle    : 'Subtitle',
                    text        : 'Text',
                    image       : '',
                    isPublished : false
                });
            });
        }).end(done);
});

after(async () => {
    await factory.cleanup();
});
