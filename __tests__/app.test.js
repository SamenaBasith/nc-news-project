const request = require ('supertest');
const db = require ('../db/connection')
const app = require ('../app.js');
const seed = require ('../db/seeds/seed.js');
const connection = require ('../db/connection');
const testData = require ('../db/data/test-data/index.js')

afterAll(() => db.end());
beforeEach(() => seed(testData));

 //error1
 describe("404 error", () => {
 test('GET status404, error handling for invalid paths', () => {
    return request(app)
    .get('/apz')
    .expect(404)
    .then((res) => {
        expect(res.body.msg).toBe('invalid path')
    })
 })
 })

describe("GET /api", () => {
    test("status 200 responds with a success message", () => {
      return request(app)
        .get('/api')
        .expect(200)
        .then((res) => {
        expect(res.body).toEqual({ msg: "success" });
        });
    });
})
  

describe('GET /api/topics', () => {
    test('GET status200, returns an array of topic objects', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then((res) => {
            const topics = res.body.topics
            console.log(topics)
            expect(res.body.hasOwnProperty('topics')).toBe(true);
            expect(topics).toBeInstanceOf(Array)
            expect(topics).toHaveLength(3)
            topics.forEach((topic) => {
                expect(topic).toEqual(
                    expect.objectContaining({
                        description: expect.any(String),
                        slug: expect.any(String),
              })
                )
            })
        })
        
    })
})
