var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PollSchema = new Schema({
    question: String,
    pollOptions: [{
        description: String,
        votes: Number
    }],
    created: Date
});

module.exports = mongoose.model("Poll", PollSchema);
