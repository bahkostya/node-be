import { assert }  from 'chai';
import supertest   from 'supertest';

import app             from '../../app';
import TestFactory     from './TestFactory';

const factory = new TestFactory();
const request = supertest.agent(app);

let token;
let newsId;

suite('News Delete');

before(async () => {
    await factory.cleanup();
    await factory.setDefaultUsers();

    const news = await factory.setDefaultNews();

    newsId = news[0]._id;
    token = await factory.login(request);
});

test('Positive: delete news', done => {
    request
        .delete(`/api/v1/news/${newsId}?token=${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.ok(res.body.status);
        }).end(done);
});

after(async () => {
    await factory.cleanup();
});
