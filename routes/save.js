const Transaction = require('../models/Transaction');

const SaveTransaction = ({net,userAddress,symbol,game,transferType,transactionID,amount}) => {
    try{
        let transaction = new Transaction({    
            net: net,        
            userAddress: userAddress,
            symbol: symbol,
            game: game,
            transferType: transferType,
            transactionID: transactionID,
            amount: amount
        })
        console.log(transaction);
        transaction.save();
    }catch(err){
        console.log(err);
    }
    
}

module.exports = SaveTransaction;