import { assert }  from 'chai';
import supertest   from 'supertest';
import app         from '../../app';
import TestFactory from  './TestFactory';

const factory     = new TestFactory();
const request     = supertest.agent(app);

let token;

/* eslint-disable */
let userId1;
let userId2;
/* eslint-enable */

suite('User List');

before(async () => {
    await factory.cleanup();
    const users = await factory.setDefaultUsers();

    userId1 = `${users[0]._id}`;
    userId2 = `${users[1]._id}`;

    token = await factory.login(request);
});

test('Positive: Show all users', done => {
    request
        .get(`/api/v1/users?token=${token}`)
        .send()
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            const resp = res;

            assert.ok(resp.body.status);

            delete resp.body.data[0].createdAt;
            delete resp.body.data[1].createdAt;

            const expectedData = [
                {
                    id         : userId1,
                    email      : 'admin1@gmail.com',
                    status     : 'ACTIVE',
                    firstName  : '',
                    secondName : ''
                },
                {
                    id         : userId2,
                    email      : 'admin2@gmail.com',
                    status     : 'BLOCKED',
                    firstName  : '',
                    secondName : ''
                }
            ];

            resp.body.data.forEach(data => {
                expectedData.forEach(expectedDataItem => {
                    if (expectedDataItem.id === data.id) {
                        assert.deepEqual(data, expectedDataItem);
                    }
                });
            });
        }).end(done);
});

test('Positive: Show user by Id', done => {
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
                email      : 'admin1@gmail.com',
                status     : 'ACTIVE',
                firstName  : '',
                secondName : ''
            });
        }).end(done);
});

test('Negative: Show user with wrong Id', done => {
    request
        .get(`/api/v1/users/54107e0ca3eeef5a662148fb?token=${token}`)
        .send()
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
    } catch (err) {
        console.error(err);
    }
});
