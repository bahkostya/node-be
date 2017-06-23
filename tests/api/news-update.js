import { assert }  from 'chai';
import supertest   from 'supertest';
import jwt         from 'jsonwebtoken';
import app         from '../../app';
import config      from '../../etc/config.json';
import TestFactory from './TestFactory';

const secret  = config.secret;
const factory = new TestFactory();
const request = supertest.agent(app);

let token;
let newsId;

suite('News Update');

before(async () => {
    await factory.cleanup();
    await factory.setDefaultUsers();

    const news = await factory.setDefaultNews();

    newsId = news[0]._id;
    token = await factory.login(request);
});

test('Positive: update news', done => {
    request
        .put(`/api/v1/news/${newsId}?token=${token}`)
        .send({ data : {
            title       : 'Title111',
            subtitle    : 'Subtitle111',
            text        : 'Text111',
            isPublished : true
        } })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.ok(res.body.status);
            jwt.verify(res.body.data.jwt, secret, (err, decoded) => {
                const decodedResp = decoded;

                if (err) {
                    throw err;
                }

                delete decodedResp.createdAt;

                assert.deepEqual(decodedResp, {
                    id          : newsId,
                    title       : 'Title111',
                    subtitle    : 'Subtitle111',
                    text        : 'Text111',
                    image       : '',
                    isPublished : true
                });
            });
        }).end(done);
});

after(async () => {
    await factory.cleanup();
});
