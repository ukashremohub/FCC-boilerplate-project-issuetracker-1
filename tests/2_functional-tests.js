const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('Testing POST', function() {
    test("POST w/ every field", function (done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .set("content-type", "application/json")
        .send({
          'issue_title': "newIssue",
          'issue_text': "newText",
          'created_by': "newCreator",
          'assigned_to': "newAssignee",
          'open': "true",
          'status_text': "newStatus"
        })
        .end(function (err, res, body) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.issue_title, 'newIssue');
          assert.equal(res.body.issue_text, 'newText');
          assert.equal(res.body.created_by, 'newCreator');
          assert.equal(res.body.assigned_to, 'newAssignee');
          assert.equal(res.body.open, true);
          assert.equal(res.body.status_text, 'newStatus');
          done();
        });
    });
    test("POST w/ only required fields", function (done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .set("content-type", "application/json")
        .send({
          'issue_title': "newIssue",
          'issue_text': "newText",
          'created_by': "newCreator"
        })
        .end(function (err, res, body) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.issue_title, 'newIssue');
          assert.equal(res.body.issue_text, 'newText');
          assert.equal(res.body.created_by, 'newCreator');
          done();
        });
    });
    test("POST w/o required fields", function (done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .set("content-type", "application/json")
        .send({
          'issue_title': "newIssue",
          'created_by': "newCreator"
        })
        .end(function (err, res, body) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });
  
  suite('Testing GET', function() {
    test("GET w/o filter", function (done) {
      chai
        .request(server)
        .get("/api/issues/test")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'Should be an array');
          done();
        });
    });
    test("GET w/ one filter", function (done) {
      chai
        .request(server)
        .get("/api/issues/test?issue_text=newText")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'Should be an array');
          done();
        });
    });
    test("GET w/ multiple filters", function (done) {
      chai
        .request(server)
        .get("/api/issues/test?issue_text=newText&created_by=newCreator")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body, '');
          done();
        });
    });
  });

  suite('Testing PUT', function() {
    test("PUT update one field", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .set("content-type", "application/json")
        .send({
          _id: "610bc9387825da04b7af5ef1",
          issue_text: "anotherText"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, '610bc9387825da04b7af5ef1');
          done();
        });
    });
    test("PUT update multiple fields", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .set("content-type", "application/json")
        .send({
          _id: "610bc9387825da04b7af5ef1",
          issue_text: "anotherText",
          created_by: "anotherCreator"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, '610bc9387825da04b7af5ef1');
          done();
        });
    });
    test("PUT update w/o _id", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
    test("PUT w/o fields to update", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .set("content-type", "application/json")
        .send({
          _id: "610bc9387825da04b7af5ef1"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'no update field(s) sent');
          assert.equal(res.body._id, '610bc9387825da04b7af5ef1');
          done();
        });
    });
    test("PUT w/ invalid _id", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .set("content-type", "application/json")
        .send({
          _id: "lullaballa",
          issue_text: "anotherText",
          created_by: "anotherCreator"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'could not update');
          assert.equal(res.body._id, 'lullaballa');
          done();
        });
    });
  });

  suite('Testing DELETE', function() {
    test("DELETE w/ invalid _id", function (done) {
      chai
        .request(server)
        .delete("/api/issues/test")
        .set("content-type", "application/json")
        .send({
          _id: "lullaballa"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'could not delete');
          assert.equal(res.body._id, 'lullaballa');
          done();
        });
    });
    test("DELETE w/o _id", function (done) {
      chai
        .request(server)
        .delete("/api/issues/test")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
    test("DELETE one item", function (done) {
      chai
        .request(server)
        .delete("/api/issues/test")
        .set("content-type", "application/json")
        .send({
          _id: "60605d91fb2f4b021cc3220a"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          if (res.req.outputSize > 0) {
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.result, 'successfully deleted');
            assert.equal(res.body._id, '60605d91fb2f4b021cc3220a');
          } else {
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.error, 'could not delete');
            assert.equal(res.body._id, '60605d91fb2f4b021cc3220a');
          }
          done();
        });
    });
  });
});