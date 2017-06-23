import { assert }  from 'chai';
import supertest   from 'supertest';

import app         from '../../app';
import TestFactory from './TestFactory';

const factory = new TestFactory();
const request = supertest.agent(app);

let token;

suite('Images Create');

before(async () => {
    await factory.createStaticFolder();
    await factory.createFixture('BigImage.jpg', 1024 * 1024 * 10);
    await factory.createFixture('EmptyImage.jpg', 0);
    await factory.cleanup();
    await factory.setDefaultUsers();

    token = await factory.login(request);
});

test('Positive: create image', done => {
    request
        .post(`/api/v1/images?token=${token}`)
        .attach('image', 'tests/api/fixtures/test.png')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.ok(res.body.status);
        }).end(done);
});

test('Negative: create big image', done => {
    request
        .post(`/api/v1/images?token=${token}`)
        .attach('image', 'tests/api/fixtures/BigImage.jpg')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.deepEqual(res.body, {
                status : 0,
                error  : {
                    fields : {
                        image : 'TOO_BIG'
                    },
                    code : 'FORMAT_ERROR'
                }
            });
        }).end(done);
});

test('Negative: create empty image', done => {
    request
        .post(`/api/v1/images?token=${token}`)
        .attach('image', 'tests/api/fixtures/EmptyImage.jpg')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.deepEqual(res.body, {
                status : 0,
                error  : {
                    fields : {
                        image : 'NO_IMAGE'
                    },
                    code : 'NO_IMAGE'
                }
            });
        }).end(done);
});

test('Negative: create image with txt', done => {
    request
        .post(`/api/v1/images?token=${token}`)
        .attach('image', 'tests/api/fixtures/test.txt')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            assert.deepEqual(res.body, {
                status : 0,
                error  : {
                    fields : {
                        image : 'WRONG_TYPE'
                    },
                    code : 'FORMAT_ERROR'
                }
            });
        }).end(done);
});


after(async () => {
    await factory.removeFixture('BigImage.jpg');
    await factory.removeFixture('EmptyImage.jpg');
    await factory.removeStaticFolder();
    await factory.cleanup();
});
