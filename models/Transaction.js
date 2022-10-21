const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({    
    net: {
        type: String,
        required: true,
    },
    userAddress: {
        type: String,
        required: true,
    },
    symbol: {
        type: String,
        required: true
    },
    game: {
        type: String,
        required: true
    },
    transferType: {
        type: String,
        required: true
    },
    transactionID: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
    },
})

module.exports = Transaction = mongoose.model("transaction",TransactionSchema);