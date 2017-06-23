import { assert }  from 'chai';
import supertest   from 'supertest';

import app from '../../app';

const request = supertest.agent(app);

suite('Contacts send');

test('Positive: send email', done => {
    request
        .post('/api/v1/contacts')
        .send({ data : {
            name        : 'Ivan',
            phoneNumber : '123321',
            email       : 'email@gmail.com',
            website     : 'http://site.com',
            solution    : 'solution',
            timeframe   : 'timeframe',
            additional  : 'text'
        } })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.ok(res.body.status);
        }).end(done);
});
