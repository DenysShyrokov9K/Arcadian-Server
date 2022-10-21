const express = require("express");
const router = express.Router();
const ethers = require("ethers");
const Contracts = require("./config.json");
const SaveTransaction = require("../save");
require("dotenv").config();

const RPCS = {
  1666600000: "https://api.harmony.one/",
  43113: 'https://api.avax-test.network/ext/bc/C/rpc'
};

const providers = {
  1666600000: new ethers.providers.JsonRpcProvider(RPCS[1666600000]),
  43113: new ethers.providers.JsonRpcProvider(RPCS[43113]),
};

const owner = new ethers.Wallet(process.env.PRIVATE_KEY, providers[1666600000]);
const avalancheowner = new ethers.Wallet(process.env.PRIVATE_KEY, providers[43113]);


const portalContract = new ethers.Contract(
  Contracts.portalcontract.address,
  Contracts.portalcontract.abi,
  owner
);

const avalanchePortalContract = new ethers.Contract(
  Contracts.avalancheportalcontract.address,
  Contracts.avalancheportalcontract.abi,
  avalancheowner
);

// @route   get api/contract/test
// @desc    test User
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "this is test" }));

// @route   get api/contract/withdraw/forOne
// @desc    test User
// @access  Public
router.post("/withdraw/forOne", async (req, res) => {
  try {
    const { withdrawAddress, withdrawAmount, gameBalance } = req.body;

    if(withdrawAmount <= gameBalance){
        const transaction = await portalContract.withDrawForOne(
        withdrawAddress,
        ethers.utils.parseEther(withdrawAmount)
        );
        console.log("transactionGasLimit = ",transaction.gasLimit.toNumber() * ethers.utils.formatEther(transaction.gasPrice));    
        
        const tx = await transaction.wait();;
        if (tx !== null) {
        const transactionParameter = {
            net:"harmony",
            userAddress: withdrawAddress,
            symbol: "ONE",
            game: "8Ball",
            transferType: "withdraw",
            transactionID: tx.transactionHash,
            amount: withdrawAmount,
        };

        SaveTransaction(transactionParameter);
        res.json("success");
        } else {
            res.status(400).json("fail");
        }
    } else {
        res.status(400).json("fail");
    }
  } catch (err) {
    res.status(400).json("fail");
  }
});

// @route   get api/contract/withdraw/forOne
// @desc    test User
// @access  Public
router.post("/withdraw/forAvax", async (req, res) => {
  try {
    const { withdrawAddress, withdrawAmount, gameBalance } = req.body;

    if(withdrawAmount <= gameBalance){
      console.log(req.body);
      
        const transaction = await avalanchePortalContract.withDraw(
        withdrawAddress,
        ethers.utils.parseEther(withdrawAmount)
        );
        console.log("transaction = ",transaction);
        //console.log("transactionGasLimit = ",transaction.gasLimit.toNumber() * ethers.utils.formatEther(transaction.gasPrice));    
        
        const tx = await transaction.wait();
        if (tx !== null) {
        const transactionParameter = {
            net:"avalanche",
            userAddress: withdrawAddress,
            symbol: "AVAX",
            game: "8Ball",
            transferType: "withdraw",
            transactionID: tx.transactionHash,
            amount: withdrawAmount,
        };

        SaveTransaction(transactionParameter);
        res.json("success");
        } else {
            res.status(400).json("fail");
        }
    } else {
        res.status(400).json("fail");
    }
  } catch (err) {
    res.status(400).json("fail");
  }
});

// @route   get api/contract/withdraw/forOther
// @desc    test User
// @access  Public
router.post("/withdraw/forOther", async (req, res) => {
  try {
    const {
      withdrawAddress,
      tokenAddress,
      withdrawAmount,
      gameBalance,
      tokenName,
    } = req.body;
    if (withdrawAmount <= gameBalance) {
      const transaction = await portalContract.withDrawForOther(
        withdrawAddress,
        tokenAddress,
        ethers.utils.parseEther(withdrawAmount)
      );
      const tx = await transaction.wait();
      if (tx !== null) {
        const transactionParameter = {
          net:"harmony",
          userAddress: withdrawAddress,
          symbol: tokenName,
          game: "8Ball",
          transferType: "withdraw",
          transactionID: tx.transactionHash,
          amount: withdrawAmount,
        };

        SaveTransaction(transactionParameter);
        return res.json("success");
      } else {
        return res.status(400).json("fail");
      }
    } else {
      return res.status(400).json("fail");
    }
  } catch (err) {
    return res.status(404).json("fail");
  }
});



module.exports = router;
