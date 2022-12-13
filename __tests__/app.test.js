const request = require("supertest");
const db = require("../db/connection");
const app = require("../app.js");
const seed = require("../db/seeds/seed.js");
const connection = require("../db/connection");
const testData = require("../db/data/test-data/index.js");

afterAll(() => db.end());
beforeEach(() => seed(testData));

//error1
describe("404 error", () => {
  test("GET status404, error handling for invalid paths", () => {
    return request(app)
      .get("/apz")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("not found");
      });
  });
});

describe("GET /api", () => {
  test("status 200 responds with a success message", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({ msg: "success" });
      });
  });
});

describe("GET /api/topics", () => {
  test("GET status200, returns an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((res) => {
        const topics = res.body.topics;
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              description: expect.any(String),
              slug: expect.any(String),
            })
          );
        });
      });
  });
});

describe("/api/articles", () => {
  test("GET status200 returns an array of article objects with these properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        const articles = res.body.articles;
        expect(articles).toHaveLength(12);
        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(String),
            })
          );
        });
      });
  });

test("status200 comment_count returns number of comments linked to each article", () => {
  return request(app)
    .get("/api/articles")
    .expect(200)
    .then((res) => {
      const articles = res.body.articles;
      expect(articles[0].comment_count).toBe("2");
    });
});

test("status200 query accepted articles sorted by columns created_at and DESC order", () => {
  return request(app)
    .get("/api/articles?sort_by=created_at&order=DESC")
    .expect(200)
    .then((res) => {
      const articles = res.body.articles;
      expect(articles).toBeSortedBy("created_at", { descending: true });
    });
});
test("status400 if bad request given: when invalid column given ", () => {
  return request(app)
    .get("/api/articles?sort_by=banana")
    .expect(400)
    .then(({ body: { msg } }) => {
      expect(msg).toBe("Bad Request");
    });
});
test("error status400 if bad request given: when invalid order given ", () => {
  return request(app)
    .get("/api/articles?order=banana")
    .expect(400)
    .then(({ body: { msg } }) => {
      expect(msg).toBe("Bad Request");
    });
});
})


describe("/api/articles/:article_id", () => {
    test("GET status200 returns an article object corressponding to the article_id passed", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then((res) => {
        const articles = res.body.article;
          expect(articles).toEqual(
            expect.objectContaining({
              article_id: 1,
              title: "Living in the shadow of a great man",
              topic: "mitch",
              author: "butter_bridge",
              created_at: "2020-07-09T20:11:00.000Z",
              votes:100
            })
          );
        });
      });
  test("error status400 responds with bad request message when passed an invalid article_id such as letters instead of number", () => {
    return request(app)
      .get("/api/articles/banana")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request: invalid input");
      });
    })
      test("404: responds message 'not found'  when article doesnt exist", () => {
        return request(app)
          .get("/api/articles/123456")
          .expect(404)
          .then(({ body: { msg }}) => {
            expect(msg).toBe("not found");
          });
      });
})

  

  
  