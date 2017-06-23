import { assert }  from 'chai';
import supertest   from 'supertest';
import app         from '../../app';
import TestFactory from  './TestFactory';

const factory = new TestFactory();
const request = supertest.agent(app);

let token;

/* eslint-disable */
let userId1;
let userId2;
/* eslint-enable */

suite('User update');

before(async () => {
    const users = [
        {
            email    : 'snow@gmail.com',
            password : 'password1',
            status   : 'ACTIVE'
        },

        {
            email    : 'login@gov.ua',
            password : 'password2',
            status   : 'PENDING'
        }
    ];


    await factory.cleanup();

    const createdUsers = await Promise.all(users.map(factory.createUser));

    userId1 = createdUsers[0].id;
    userId2 = createdUsers[1].id;

    return new Promise(resolve => {
        request // Authenticate
            .post('/api/v1/sessions')
            .send({ data: { email: 'snow@gmail.com', password: 'password1' } })
            .expect(res => {
                assert.ok(res.body.status);
            }).end((err, res) => {
                if (err) {
                    throw err;
                }

                token = res.body.data.jwt;
                resolve();
            });
    });
});

test('Positive: Update user', done => {
    request
        .put(`/api/v1/users/${userId1}?token=${token}`)
        .send({
            data : {
                firstName  : 'Jon',
                secondName : 'Snow'
            }
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.ok(res.body.status);
        }).end(done);
});

test('Positive: Check updated user', done => {
    request
        .get(`/api/v1/users/${userId1}?token=${token}`)
        .send()
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            const resp = res;

            assert.ok(resp.body.status);
            delete resp.body.data.createdAt;

            assert.deepEqual(resp.body.data, {
                id         : userId1,
                email      : 'snow@gmail.com',
                status     : 'ACTIVE',
                firstName  : 'Jon',
                secondName : 'Snow'
            });
        }).end(done);
});

test('Negative: Update user with wrong Id', done => {
    request
        .put(`/api/v1/users/54107e0ca3eeef5a662148fb?token=${token}`)
        .send({
            data : {
                language : 'en'
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

test('Negative: Update other user', done => {
    request
        .put(`/api/v1/users/${userId2}?token=${token}`)
        .send({
            data : {
                companyName : 'New kingdom'
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

after(async () => {
    try {
        await factory.cleanup();
    } catch (e) {
        console.error(e);
        throw e;
    }
});
