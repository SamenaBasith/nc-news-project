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

describe("GET /api/articles", () => {
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
});

describe("GET /api/articles/:article_id", () => {
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
            votes: 100,
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
  });
  test("404: responds message 'not found'  when article doesnt exist", () => {
    return request(app)
      .get("/api/articles/123456")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("status200: responds with an array of comments for a given article_id with these properties", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        const comments = res.body.comments;
        expect(comments).toHaveLength(11);
        comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
            })
          );
        });
      });
  });

  test("status200: accept query, responds with an array of comments for a given article_id with the most recent comments first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        const comments = res.body.comments;
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("status200: responds with an empty array when an article that exists has no comments", () => {
    return request(app)
      .get("/api/articles/4/comments")
      .expect(200)
      .then((res) => {
        const comments = res.body.comments;
        expect(comments).toHaveLength(0);
      });
  });

  test("error status400: responds with a bad request message when passed invalid article_id", () => {
    return request(app)
      .get("/api/articles/banana/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request: invalid input");
      });
  });

  test("error status404: responds with a not found message when article does not exist", () => {
    return request(app)
      .get("/api/articles/123456/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });

  test("status201: just checking if the user passes in an extra vote key, it is ignored ", () => {
        
    const newComment = {
      username: "butter_bridge",
      body: "this article is great!",
      votes: 200
    };
    return request(app)
    .post("/api/articles/1/comments")
    .send(newComment)
    .expect(201)
    .then(({ body }) => {
      expect(body.newComment).toEqual(
        expect.objectContaining({
          comment_id: expect.any(Number),
          body: "this article is great!",
          author: "butter_bridge",
          article_id: 1,
          votes: expect.any(Number),
          created_at: expect.any(String),
        })
      );
    });
});
})


describe("POST /api/articles/:article_id/comments", () => {
  test("status201: responds with the newly posted comment for the given article_id when passed a valid article_id and a comment object", () => {
    const newComment = {
      username: "butter_bridge",
      body: "post comment here for article_id 1",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.newComment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            body: "post comment here for article_id 1",
            author: "butter_bridge",
            article_id: 1,
            votes: expect.any(Number),
            created_at: expect.any(String),
          })
        );
      });
  });

  //errors for invalid path
  test("error status400: responds with a bad request message when passed a string for article_id invalid type", () => {
    const newComment = {
      username: "butter_bridge",
      body: "post comment here for article_id 1",
    };
    return request(app)
      .post("/api/articles/banana/comments")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request: invalid input");
      });
  });

  test("error status404: responds with message not found when article_id that does not exist is passed", () => {
    const newComment = {
      username: "butter_bridge",
      body: "this comment cannot be posted",
    };
    return request(app)
      .post("/api/articles/12345/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });

  //error for invalid input type for username and body

  test("error status404: responds with a not found message when passed a number for username ", () => {
    const newComment = {
      username: 1,
      body: "the username isnt right",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });

  test("error status400: responds with a bad request message when username/body are empty", () => {
    const newComment = {};
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request: no input");
      });
  });

  test("error status404: responds with message not found when valid article_id is passed BUT username does not exist", () => {
    const newComment = {
      username: "samena",
      body: "this comment cannot be posted",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("status202: responds with the accepted updated article object", () => {
    const updatedVote = { inc_votes: 50 };
    return request(app)
      .patch("/api/articles/1")
      .send(updatedVote)
      .expect(202)
      .then(({ body: { updatedArticle } }) => {
        expect(updatedArticle).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 150,
        });
      });
  });

  test("status202: responds with the accepted updated article object this time with a negative vote", () => {
    const updatedVote = { inc_votes: -5 };
    return request(app)
      .patch("/api/articles/1")
      .send(updatedVote)
      .expect(202)
      .then(({ body: { updatedArticle } }) => {
        expect(updatedArticle).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 95,
        });
      });
  });



  test("error status400: responds with a bad request message when passed an invalid type for inc_votes like a string", () => {
    const updatedVote = { inc_votes: "banana" };
    return request(app)
      .patch("/api/articles/1")
      .send(updatedVote)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request: invalid input");
      });
  });

  test("error status400: responds with a bad request message when passed an invalid article_id", () => {
    const updatedVote = { inc_votes: 50 };
    return request(app)
      .patch("/api/articles/banana")
      .send(updatedVote)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request: invalid input");
      });
  });

  test("error status404: responds with not found message when passed an article_id that does not exist", () => {
    const updatedVote = { inc_votes: 50 };
    return request(app)
      .patch("/api/articles/2345")
      .send(updatedVote)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
});


describe("GET /api/users", () => {
  test("status200: responds with an object with a key called users, and an array in that object with all the users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: {users} }) => {
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

//get articles/article_id refactored
describe("GET /api/articles/:article_id QUERY (comment count)",() => {
  test("status200: responds with an object which contains the article and how many comments it has",() => {
      return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then((res) => {
        const article = res.body.article;
          expect(article).toEqual(
              expect.objectContaining({
                author: "butter_bridge",
                article_id: 1,
                title: "Living in the shadow of a great man",
                topic: "mitch",
                created_at: "2020-07-09T20:11:00.000Z",
                votes: 100,
                comment_count: "11"
            })
          );
        });
      });

  test("status200: responds with an object which contains the article and how many comments it has- this test is checking to see function works for an article with no comments",() => {
    return request(app)
    .get('/api/articles/4')
    .expect(200)
    .then((res) => {
      const article = res.body.article;
        expect(article).toEqual(
            expect.objectContaining({
              author: "rogersop",
              article_id: 4,
              title: "Student SUES Mitch!",
              topic: "mitch",
              created_at: "2020-05-06T01:14:00.000Z",
              votes: 0,
              comment_count: "0"
          })
        );
      });
    });
});


describe("DELETE /api/comments/:comment_id", () => {
  test("status204: responds with no content message when passed existing and valid comment_id", () => {
    return request(app)
    .delete("/api/comments/1").
    expect(204)
    .then((response) => {
      expect(response.body).toEqual({})
      expect(response.res.statusMessage).toEqual("No Content");
      
    });;
  });

  test("status204: checking that number of comments for that comment_id decreases using a GET request", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        const comments = res.body.comments
        expect(comments).toHaveLength(11);

        return request(app)
        .delete("/api/comments/5")
        .expect(204)
      })
      .then(() => {
        return request(app)
        .get("/api/articles/1/comments");
      })
      .then((res) => {
        const commentsAfterDeletion = res.body.comments
        expect(commentsAfterDeletion).toHaveLength(10);
      });
  });

  test("error status400: responds with bad request message when passed invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/banana")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request: invalid input");
      });
  });

  test("error status404: responds with not found message when passed non existing comment_id but valid data type", () => {
    return request(app)
      .delete("/api/comments/12345")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
});
 
 
