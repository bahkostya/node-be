import { assert }  from 'chai';
import supertest   from 'supertest';
import app         from '../../app';
import TestFactory from './TestFactory';

const factory     = new TestFactory();
const request     = supertest.agent(app);

suite('User create');

before(async () => {
    await factory.cleanup();
    await factory.setDefaultUsers();
});

test('Positive: Send email', done => {
    request
        .post('/api/v1/users')
        .send({
            data : {
                email    : 'testuser@gmail.com',
                password : '123456'
            }
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.ok(res.body.status);
        }).end(done);
});

test('Positive: Create user', done => {
    request
        .post('/api/v1/users')
        .send({
            data : {
                email    : 'testuser1@gmail.com',
                password : '123456'
            }
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.ok(res.body.status);
        }).end(done);
});

test('Negative: Send not unique email', done => {
    request
        .post('/api/v1/users')
        .send({
            data : {
                email    : 'admin1@gmail.com',
                password : 'dsfdf'
            }
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.deepEqual(res.body, {
                status : 0,
                error  : {
                    code   : 'NOT_UNIQUE',
                    fields : {
                        email : 'NOT_UNIQUE'
                    }
                }
            });
        }).end(done);
});

test('Negative: Create user without email and password', done => {
    request
        .post('/api/v1/users')
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

test('Negative: Create user without data', done => {
    request
        .post('/api/v1/users')
        .send({})
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.deepEqual(res.body, {
                status : 0,
                error  : {
                    code   : 'FORMAT_ERROR',
                    fields : {
                        data : 'REQUIRED'
                    }
                }
            });
        }).end(done);
});

test('Negative: Create user with wrong email', done => {
    request
        .post('/api/v1/users')
        .send({
            data : {
                email    : 'login',
                password : 'password'
            }
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.deepEqual(res.body, {
                status : 0,
                error  : {
                    code   : 'FORMAT_ERROR',
                    fields : {
                        'data/email' : 'WRONG_EMAIL'
                    }
                }
            });
        }).end(done);
});

after(async () => {
    try {
        await factory.cleanup();
    } catch (e) {
        console.error(e);
        throw e;
    }
});
