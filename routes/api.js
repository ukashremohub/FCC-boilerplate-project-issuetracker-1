'use strict';
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const url = require('url');
const mongodb = require('mongodb');
const mongoose = require("mongoose");
require('dotenv').config();

const urlEncodedParser = bodyParser.urlencoded({extended: false});

app.use(express.json());

mongoose.connect(process.env["MONGO_URI"],
{ 
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const issueSchema = new mongoose.Schema({
  project_name: {type: String, equired: true},
  issue_title: {type: String, required: true},
  issue_text: {type: String, required: true},
  created_on: Date,
  updated_on: Date,
  created_by: {type: String, required: true},
  assigned_to: String,
  open: Boolean,
  status_text: String
});
const Issue = mongoose.model('Issue', issueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
    .get(function (req, res){// debug: 100
      let project = req.params.project;
      let rQuery = req.query;
      let query = {};

      query = {
        project_name: project,
        ...rQuery
      }
      
      Issue.find(query, (err, data) => {
        if (err) {
          return console.error({err});
        } else {
          let result = [];
          data.forEach((item) => {
            let reItem = {}
            
            reItem._id = item._id || '';
            reItem.issue_title = item.issue_title || '';
            reItem.issue_text = item.issue_text || '';
            reItem.created_by = item.created_by || '';
            reItem.assigned_to = item.assigned_to || '';
            reItem.open = item.open || '';
            reItem.status_text = item.status_text || '';
            reItem.created_on = item.created_on || '';
            reItem.updated_on = item.updated_on || '';
            
            result.push(reItem);
          })
          res.send(result);
          return;
        }
      })
    })
    .post(function (req, res){// debug: 200
      let project = req.params.project;
      let now = new Date(Date.now());
      let newIssue = new Issue ({
        project_name: project,
        ...req.body,
        created_on: now,
        updated_on: now,
        open: true
      });
      if (
        (!newIssue.issue_title) ||
        (!newIssue.issue_text) ||
        (!newIssue.created_by)
      ) {
        return res.json({error: "required field(s) missing"})
      } else {
        newIssue.save((err, data) => {
          if (err) {
            return console.error(err);
          } else {
            let response = {};
            response._id = data._id || '';
            response.project_name = data.project_name || '';
            response.issue_title = data.issue_title || '';
            response.issue_text = data.issue_text || '';
            response.created_by = data.created_by || '';
            response.assigned_to = data.assigned_to || '';
            response.open = data.open || '';
            response.status_text = data.status_text || '';
            response.created_on = data.created_on || '';
            response.updated_on = data.updated_on || '';

            res.json(response);
            return;
          }
        })
      }
    })
    .put(function (req, res){// debug: 300
      let project = req.params.project;
      let _id = req.body._id;
      if (!_id) {
        res.json({error: "missing _id"});
        return;
      }
      if (
        (!req.body.issue_title) &&
        (!req.body.issue_text) &&
        (!req.body.created_on) &&
        (!req.body.updated_on) &&
        (!req.body.created_by) &&
        (!req.body.assigned_to) &&
        (!req.body.open) &&
        (!req.body.status_text)
      ) {
        res.json({error: "no update field(s) sent", _id: _id});
        return;
      };
      let now = new Date(Date.now());
      let updates = {
        ...req.body,
        updated_on: now
      }
      delete updates['_id'];
      Issue.updateOne({_id: _id}, updates, (err, data) => {
        if (err) {
          res.json({
            error: "could not update",
            _id: _id
          });
          return;
        } else {
          if (data.n === 0) {
            res.json({
              error: "could not update",
              _id: _id
              });
            return;
          } else {
            res.json({
              result: "successfully updated",
              _id: _id
            })
            return;
          }
        }
      })
    })
    .delete(function (req, res){// debug: 400
      let project = req.params.project;
      let _id = req.body._id;
      if (!_id) {
        res.json({ error: 'missing _id' });
        return;
      } else {
        Issue.deleteOne({_id: _id}, (err, data) => {
          if ((data) && (data.n > 0)) {
            res.json({result: 'successfully deleted', '_id': _id});
            return;
          } else {
            res.json({error: 'could not delete', '_id': _id});
            return;
          }
        });
      };
    });
};
