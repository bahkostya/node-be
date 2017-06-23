import { assert }  from 'chai';
import supertest   from 'supertest';
import app         from '../../app';
import TestFactory from  './TestFactory';

const factory     = new TestFactory();
const request     = supertest.agent(app);

suite('User Reset Password');

before(async () => {
    await factory.cleanup();
    await factory.setDefaultUsers();
});

test('Positive: Send email', done => {
    request
        .post('/api/v1/users/resetPassword')
        .send({
            data : {
                email : 'admin1@gmail.com'
            }
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.ok(res.body.status);
        }).end(done);
});


test('Negative: Invalid user data', done => {
    request
        .post(`/api/v1/actions/${process.env.LAST_ACTION_ID}`)
        .send({
            data : {
                password        : 'password',
                confirmPassword : 'wordpass'
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
                        confirmPassword : 'FIELDS_NOT_EQUAL'
                    }
                }
            });
        }).end(done);
});

test('Positive: Reset password', done => {
    request
        .post(`/api/v1/actions/${process.env.LAST_ACTION_ID}`)
        .send({
            data : {
                password        : 'password',
                confirmPassword : 'password'
            }
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.ok(res.body.status);
        }).end(done);
});

test('Negative: Reset password with not existing actionID', done => {
    request
        .post(`/api/v1/actions/${process.env.LAST_ACTION_ID}`)
        .send({
            data : {
                password        : 'password',
                confirmPassword : 'password'
            }
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.deepEqual(res.body, {
                status : 0,
                error  : {
                    code   : 'WRONG_ID',
                    fields : {
                        id : 'WRONG_ID'
                    }
                }
            });
        }).end(done);
});

test('Negative: Try reset password for nonexistent user', done => {
    request
        .post('/api/v1/users/resetPassword')
        .send({
            data : {
                email : 'wronguser@gmail.com'
            }
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.deepEqual(res.body, {
                status : 0,
                error  : {
                    code   : 'NOT_FOUND',
                    fields : {
                        email : 'NOT_FOUND'
                    }
                }
            });
        }).end(done);
});

test('Negative: Try reset password for blocked user', done => {
    request
        .post('/api/v1/users/resetPassword')
        .send({
            data : {
                email : 'admin2@gmail.com'
            }
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.deepEqual(res.body, {
                status : 0,
                error  : {
                    code   : 'BLOCKED_USER',
                    fields : {
                        email : 'BLOCKED_USER'
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
