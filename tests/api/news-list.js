import { assert }  from 'chai';
import supertest   from 'supertest';

import app             from '../../app';
import TestFactory     from './TestFactory';

const factory = new TestFactory();
const request = supertest.agent(app);

/* eslint-disable */
let newsId1;
let newsId2;
let newsId3;
/* eslint-enable */

suite('News List');

before(async () => {
    await factory.cleanup();
    await factory.setDefaultUsers();

    const news = await factory.setDefaultNews();

    newsId1 = `${news[0]._id}`;
    newsId2 = `${news[1]._id}`;
    newsId3 = `${news[2]._id}`;
});

test('Positive: Show all news', done => {
    request
        .get('/api/v1/news')
        .send()
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            const resp = res;

            assert.ok(resp.body.status);

            delete resp.body.data[0].createdAt;
            delete resp.body.data[1].createdAt;
            delete resp.body.data[2].createdAt;

            const expectedData = [
                {
                    id          : newsId1,
                    title       : 'Title',
                    subtitle    : 'Subtitle',
                    text        : 'Text',
                    image       : '',
                    isPublished : false
                },
                {
                    id          : newsId2,
                    title       : 'Title2',
                    subtitle    : 'Subtitle2',
                    text        : 'Text2',
                    image       : '',
                    isPublished : false
                },
                {
                    id          : newsId3,
                    title       : 'Title3',
                    subtitle    : 'Subtitle3',
                    text        : 'Text3',
                    image       : '',
                    isPublished : false
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

test('Positive: Show news by Id', done => {
    request
        .get(`/api/v1/news/${newsId1}`)
        .send()
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            const resp = res;

            assert.ok(res.body.status);
            delete resp.body.data.createdAt;

            assert.deepEqual(resp.body.data, {
                id          : newsId1,
                title       : 'Title',
                subtitle    : 'Subtitle',
                text        : 'Text',
                image       : '',
                isPublished : false
            });
        }).end(done);
});

test('Negative: Show news with wrong Id', done => {
    request
        .get('/api/v1/news/54107e0ca3eeef5a662148fb')
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
    await factory.cleanup();
});
