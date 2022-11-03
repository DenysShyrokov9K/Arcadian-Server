const Transaction = require('../models/Transaction');

const SaveTransaction = ({net,userAddress,symbol,game,transferType,transactionID,amount,progress,display}) => {
    try{
        let transaction = new Transaction({    
            net: net,        
            userAddress: userAddress,
            symbol: symbol,
            game: game,
            transferType: transferType,
            transactionID: transactionID,
            amount: amount,
            progress:progress,
            display: display
        })
        console.log("save  = ",transaction);
        transaction.save();
        return ;
    }catch(err){
        console.log(err);
    }    
}

module.exports = SaveTransaction;