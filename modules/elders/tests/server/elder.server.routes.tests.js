'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Elder = mongoose.model('Elder'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, elder;

/**
 * Elder routes tests
 */
describe('Elder CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new elder
    user.save(function () {
      elder = {
        title: 'Elder Title',
        content: 'Elder Content'
      };

      done();
    });
  });

  it('should be able to save an elder if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new elder
        agent.post('/api/elders')
          .send(elder)
          .expect(200)
          .end(function (elderSaveErr, elderSaveRes) {
            // Handle elder save error
            if (elderSaveErr) {
              return done(elderSaveErr);
            }

            // Get a list of elders
            agent.get('/api/elders')
              .end(function (eldersGetErr, eldersGetRes) {
                // Handle elder save error
                if (eldersGetErr) {
                  return done(eldersGetErr);
                }

                // Get elders list
                var elders = eldersGetRes.body;

                // Set assertions
                (elders[0].user._id).should.equal(userId);
                (elders[0].title).should.match('Elder Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an elder if not logged in', function (done) {
    agent.post('/api/elders')
      .send(elder)
      .expect(403)
      .end(function (elderSaveErr, elderSaveRes) {
        // Call the assertion callback
        done(elderSaveErr);
      });
  });

  it('should not be able to save an elder if no title is provided', function (done) {
    // Invalidate title field
    elder.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new elder
        agent.post('/api/elders')
          .send(elder)
          .expect(400)
          .end(function (elderSaveErr, elderSaveRes) {
            // Set message assertion
            (elderSaveRes.body.message).should.match('Title cannot be blank');

            // Handle elder save error
            done(elderSaveErr);
          });
      });
  });

  it('should be able to update an elder if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new elder
        agent.post('/api/elders')
          .send(elder)
          .expect(200)
          .end(function (elderSaveErr, elderSaveRes) {
            // Handle elder save error
            if (elderSaveErr) {
              return done(elderSaveErr);
            }

            // Update elder title
            elder.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing elder
            agent.put('/api/elders/' + elderSaveRes.body._id)
              .send(elder)
              .expect(200)
              .end(function (elderUpdateErr, elderUpdateRes) {
                // Handle elder update error
                if (elderUpdateErr) {
                  return done(elderUpdateErr);
                }

                // Set assertions
                (elderUpdateRes.body._id).should.equal(elderSaveRes.body._id);
                (elderUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of elders if not signed in', function (done) {
    // Create new elder model instance
    var elderObj = new Elder(elder);

    // Save the elder
    elderObj.save(function () {
      // Request elders
      request(app).get('/api/elders')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single elder if not signed in', function (done) {
    // Create new elder model instance
    var elderObj = new Elder(elder);

    // Save the elder
    elderObj.save(function () {
      request(app).get('/api/elders/' + elderObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', elder.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single elder with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/elders/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Elder is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single elder which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent elder
    request(app).get('/api/elders/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No elder with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an elder if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new elder
        agent.post('/api/elders')
          .send(elder)
          .expect(200)
          .end(function (elderSaveErr, elderSaveRes) {
            // Handle elder save error
            if (elderSaveErr) {
              return done(elderSaveErr);
            }

            // Delete an existing elder
            agent.delete('/api/elders/' + elderSaveRes.body._id)
              .send(elder)
              .expect(200)
              .end(function (elderDeleteErr, elderDeleteRes) {
                // Handle elder error error
                if (elderDeleteErr) {
                  return done(elderDeleteErr);
                }

                // Set assertions
                (elderDeleteRes.body._id).should.equal(elderSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an elder if not signed in', function (done) {
    // Set elder user
    elder.user = user;

    // Create new elder model instance
    var elderObj = new Elder(elder);

    // Save the elder
    elderObj.save(function () {
      // Try deleting elder
      request(app).delete('/api/elders/' + elderObj._id)
        .expect(403)
        .end(function (elderDeleteErr, elderDeleteRes) {
          // Set message assertion
          (elderDeleteRes.body.message).should.match('User is not authorized');

          // Handle elder error error
          done(elderDeleteErr);
        });

    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Elder.remove().exec(done);
    });
  });
});
