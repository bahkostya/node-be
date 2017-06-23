import { assert }  from 'chai';
import supertest   from 'supertest';
import jwt         from 'jsonwebtoken';

import app         from '../../app';
import config      from '../../etc/config.json';
import TestFactory from './TestFactory';

const secret  = config.secret;
const factory = new TestFactory();
const request = supertest.agent(app);

let userId;

suite('Sessions Create');

before(async () => {
    await factory.cleanup();
    const users = await factory.setDefaultUsers();

    userId = users[0]._id;
});

test('Positive: authenticate user', done => {
    request
        .post('/api/v1/sessions')
        .send({ data: { email: 'admin1@gmail.com', password: 'password1' } })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.ok(res.body.status);
            jwt.verify(res.body.data.jwt, secret, (err, decoded) => {
                if (err) throw err;

                const decodedResp = decoded;

                delete decodedResp.iat;
                delete decodedResp.createdAt;

                assert.deepEqual(decodedResp, {
                    id         : userId,
                    email      : 'admin1@gmail.com',
                    status     : 'PENDING',
                    firstName  : '',
                    secondName : ''
                });
            });
        }).end(done);
});

test('Positive: Login user', done => {
    request
        .post('/api/v1/sessions')
        .send({ data: { email: 'admin1@gmail.com', password: 'password1' } })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.deepEqual(res.body, {
                status : 1,
                data   : {
                    jwt : res.body.data.jwt
                }
            });
        }).end(done);
});

test('Negative: authenticate blocked user', done => {
    request
        .post('/api/v1/sessions')
        .send({ data: { email: 'admin2@gmail.com', password: 'password2' } })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.deepEqual(res.body, {
                status : 0,
                error  : {
                    code   : 'NOT_ACTIVE_USER',
                    fields : {
                        status : 'NOT_ACTIVE_USER'
                    }
                }
            });
        }).end(done);
});

test('Negative: Wrong password', done => {
    request
        .post('/api/v1/sessions')
        .send({ data: { email: 'test_user@gmail.com', password: '123456' } })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.deepEqual(res.body, {
                status : 0,
                error  : {
                    code   : 'AUTHENTICATION_FAILED',
                    fields : {
                        email    : 'INVALID',
                        password : 'INVALID'
                    }
                }
            });
        }).end(done);
});

test('Negative: Empty data', done => {
    request
        .post('/api/v1/sessions')
        .send({ data: {} })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.deepEqual(res.body, {
                status : 0,
                error  : {
                    code   : 'FORMAT_ERROR',
                    fields : {
                        'data/email'    : 'REQUIRED',
                        'data/password' : 'REQUIRED'
                    }
                }
            });
        }).end(done);
});

after(async () => {
    await factory.cleanup();
});
