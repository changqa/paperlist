const mongoose = require('mongoose')

mongoose.connect("mongodb://localhost:27017/test", {
    useNewUrlParser: true
});

const UserSchema = new mongoose.Schema(
    {
        sid: {type: String},
        name: {type: String}
    },
    {
        collection: 'users'
    })

const PaperSchema = new mongoose.Schema(
    {
        Owner: {type: String}
    },
    {
        collection: 'paperlist'
    }
)

const User = mongoose.model('User', UserSchema)
const Paper = mongoose.model('Paper', PaperSchema)

module.exports = {User, Paper}