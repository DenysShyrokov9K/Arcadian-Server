const express = require("express");
const router = express.Router();
const Transaction = require('../../models/Transaction');
const SaveTransaction = require('../save');

// @route   get api/users/test
// @desc    test User
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "this is test" }));

// @route   POST api/transaction
// @desc    Register User
// @access  Public
router.post("/", (req,res) => {
    try{        
        SaveTransaction(req.body);
        res.json("success");
    } catch(err){
        res.status(404).json("Transaction Error");
    }
});

// @route   POST api/transaction/findResults
// @desc    Register User
// @access  Public
router.post("/findResults",async (req,res) => {
    try{
        const {net,userAddress,transferType,selectedGame,selectedToken,selectedSort} = req.body;
        let users; 
        if(selectedToken === "allTokens"){
            if(selectedSort === "latest")
                users = await Transaction.find({net:net,userAddress: userAddress,game: selectedGame,transferType : transferType, progress: "success", display: 1}).sort({date: -1});
            else users = await Transaction.find({net:net,userAddress: userAddress,game: selectedGame,transferType : transferType, progress: "success", display: 1}).sort({date: 1});
        }
        else {
            if(selectedSort === "latest")
                users = await Transaction.find({net:net,userAddress: userAddress,game: selectedGame,transferType : transferType,symbol: selectedToken, progress: "success", display: 1}).sort({date: -1});
            else users = await Transaction.find({net:net,userAddress: userAddress,game: selectedGame,transferType : transferType,symbol: selectedToken, progress: "success", display: 1}).sort({date: 1});
        }
        res.json(users);
    }catch(err) {
        res.status(404).json("find error");
    }
})

router.post("/getProgress",async (req,res) => {
    try{
        const {userAddress} = req.body;
        let users;
        users = await Transaction.find({userAddress: userAddress,transferType:"withdraw"});
        res.json(users);
    } catch(err) {
        return res.status(404).json("fail");
    }
})

router.post("/getDepositProgress",async (req,res) => {
    try{
        const {userAddress} = req.body;
        let users;
        users = await Transaction.find({userAddress: userAddress,transferType:"deposit"});
        res.json(users);
    } catch(err) {
        return res.status(404).json("fail");
    }
})

router.post("/setDepositProgress",async (req,res) => {
    try{
        const {userAddress} = req.body;
        let users = await Transaction.find({userAddress: userAddress,transferType:"deposit"});
        if(users.length > 0){
            //console.log("setProgressUser = ",users)
            for(i=0;i<users.length;i++){
                users[i].display =1;
                users[i].save();
            }
            // users.save();s
            res.json("success");
        } else {
            console.log("nothing");
            res.json("nothing");
        }
    } catch(err) {
        return res.status(404).json("fail");
    }
})

router.post("/setProgress",async (req,res) => {
    try{
        const {userAddress} = req.body;
        let users = await Transaction.find({userAddress: userAddress,transferType:"withdraw"});
        if(users.length > 0){
            //console.log("setProgressUser = ",users)
            for(i=0;i<users.length;i++){
                users[i].display =1;
                users[i].save();
            }
            // users.save();s
            res.json("success");
        } else {
            console.log("nothing");
            res.json("nothing");
        }
    } catch(err) {
        return res.status(404).json("fail");
    }
})

router.post("/deletePortal",async (req,res) => {
    try{
        const {net,userAddress,transferType} = req.body;
        console.log(userAddress);
        console.log(transferType);
        let users = await Transaction.find({net:net,userAddress: userAddress,transferType: transferType});

        if(users){
            await Transaction.deleteMany({net:net,userAddress: userAddress,transferType: transferType});
            res.json("success");
        }else {
            res.json("fail");
        }
    }catch(err) {
        res.status(404).json("fail");
    }
})

module.exports = router;