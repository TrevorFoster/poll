var Poll = require("../models/poll");
var express = require("express");
var router = express.Router();

router.route("/polls").post(function(req, res) {
    var poll = new Poll(req.body);

    poll.save(function(err) {
        if (err) {
            return res.send(err);
        }

        res.json(poll);
    });
}).get(function(req, res) {
    Poll.find(function(err, polls) {
        if (err) {
            return res.send(err);
        }

        res.json(polls);
    });
});

router.route("/polls/:id").get(function(req, res) {
    Poll.findOne({
        _id: req.params.id
    }, function(err, poll) {
        if (err) {
            err.error = true;
            return res.send(err);
        }

        res.json(poll);
    });
}).post(function(req, res) {
    Poll.findOne({
        _id: req.params.id
    }, function(err, poll) {
        if (err) {
            return res.send(err);
        }

        for (prop in req.body) {
            poll[prop] = req.body[prop];
        }

        // save the poll
        poll.save(function(err) {
            if (err) {
                return res.send(err);
            }

            res.json({
                message: "Proj updated!"
            });
        });
    });
}).delete(function(req, res) {
    if (req.params.id == -1) {
        Poll.collection.remove(function() {
            res.json({
                message: "CLEARED"
            });
        });
    } else {
        Poll.remove({
            _id: req.params.id
        }, function(err, poll) {
            if (err) {
                return res.send(err);
            }

            res.json({
                message: "Successfully deleted"
            });
        });
    }
});


router.route("/polls/:PollId/option/:OptionId").get(function(req, res) {
    Poll.update({
        _id: req.params.PollId,
        "pollOptions._id": req.params.OptionId
    }, {
        "$inc": {
            "pollOptions.$.votes": 1
        }
    }, function(err, poll) {
        if (err) {
            err.error = true;
            return res.send(err);
        }

        res.json({
            message: "Vote added!"
        });
    });
});

module.exports = router;
