const express = require("express");
const router = express.Router();
const ethers = require("ethers");
const Contracts = require("./config.json");
const SaveTransaction = require("../save");
const { PlayFab, PlayFabClient } = require("playfab-sdk");

require("dotenv").config();

const RPCS = {
  1666600000: "https://api.harmony.one/",
  43114: "https://api.avax.network/ext/bc/C/rpc",
};

const providers = {
  1666600000: new ethers.providers.JsonRpcProvider(RPCS[1666600000]),
  43114: new ethers.providers.JsonRpcProvider(RPCS[43114]),
};

const owner = new ethers.Wallet(process.env.PRIVATE_KEY, providers[1666600000]);
const avalancheowner = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  providers[43114]
);

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

let wallets = [];
let withdrawAmounts = [];
let withdrawTokens = [];
let withdrawTokenNames = [];
let WithdrawVCRequests = [];

let depositVCRequests = [];
let depositWallets = [];
let depositTokenNames = [];
let _tx_deposit_states = false;
let tx_deposit_states = false;

let progressingDepositVCRequest;
let progressingDepositWallet;
let progressingDepositTokenName;

let progressingWallet;
let progressingToken;
let progressingTokenName;
let progressingAmount;
let progressVCRequest;
let tx_states = false;
let _tx_states = false;
let tx;



const WithdrawTransaction = async () => {
  try {
    if(tx_states === true)
    {
      progressingWallet = wallets.shift();
      progressingToken = withdrawTokens.shift();
      progressingTokenName = withdrawTokenNames.shift();
      progressingAmount = withdrawAmounts.shift();
      progressVCRequest = WithdrawVCRequests.shift();
      PlayFab.settings.titleId = "1C79C";
      const loginRequest = {  
        TitleId: "1C79C",
        CustomId: progressingWallet,
        CreateAccount: true,
      };
      await PlayFabClient.LoginWithCustomID(loginRequest, (err, result) => {
        if (result !== {}) {
          PlayFabClient.ExecuteCloudScript(
            {
              FunctionName: "WithdrawVC",
              FunctionParameter: progressVCRequest,
            },
            (err, result) => {
              if (result !== "") {
                if (tx_states === false) {
                } else {
                  return ;
                }
              } else if (err !== "") {
                return;
              }
            }
          );
        }
      });
    }
    tx_states = true;
    let transaction;
    if(progressingTokenName === "AVAX"){
      transaction = await avalanchePortalContract.withDraw(
        progressingWallet,
        progressingAmount
      );
    } else {
      transaction = await portalContract.withDrawTokens(
        progressingWallet,
        progressingToken,
        progressingAmount
      );
    }
    tx = await transaction.wait();
    if (tx !== null) {
      const transactionParameter = {
        net: progressingTokenName === "AVAX" ? "avalanche" : "harmony",
        userAddress: progressingWallet,
        symbol: progressingTokenName,
        game: "8Ball",
        transferType: "withdraw",
        transactionID: tx.transactionHash,
        amount: ethers.utils.formatEther(progressingAmount),
        progress: "success",
        display: 0,
      };
      SaveTransaction(transactionParameter);
    }
    if (wallets.length > 0) {
      WithdrawTransaction();
    } else {
      _tx_states = false;
      tx_states = false;
    }
  } catch (err) {
    const transactionParameter = {
      net: progressingTokenName === "AVAX" ? "avalanche" : "harmony",
      userAddress: progressingWallet,
      symbol: progressingTokenName,
      game: "8Ball",
      transferType: "withdraw",
      transactionID: "txFail",
      amount: ethers.utils.formatEther(progressingAmount),
      progress: "fail",
      display: 0,
    };
    PlayFab.settings.titleId = "1C79C";
    const loginRequest = {
      TitleId: "1C79C",
      CustomId: progressingWallet,
      CreateAccount: true,
    };
    const DepositVCRequest = {
      currencycode:
        (progressingTokenName === "ONE" && "ON") ||
        (progressingTokenName === "MTO" && "MT") ||
        (progressingTokenName === "ARC" && "AR") ||
        (progressingTokenName === "SON" && "SO") || 
        (progressingTokenName === "AVAX" && "AV"),
      inputValue: ethers.utils.formatEther(progressingAmount),
      walletaddress: progressingWallet,
    };
    PlayFabClient.LoginWithCustomID(loginRequest, (err, result) => {
      if (result !== {}) {
        PlayFabClient.ExecuteCloudScript(
          {
            FunctionName: "DepositVC",
            FunctionParameter: DepositVCRequest,
          },
          (err, result) => {
            if (result !== "") {
              SaveTransaction(transactionParameter);
              if (wallets.length > 0) {
                WithdrawTransaction();
              } else {
                _tx_states = false;
                tx_states = false;
              }
            } else if (err !== "") {
              return;
            }
          }
        );
      }
    });
  }
};

router.post("/withdraw", async (req, res) => {
  try {
    const {
      withdrawAddress,
      tokenAddress,
      withdrawAmount,
      gameBalance,
      tokenName,
      WithdrawVCRequest,
    } = req.body;
    res.json(wallets.length)
    if (withdrawAmount <= gameBalance) {
      console.log(WithdrawVCRequest);
      const transactionParameter = {
        net: tokenName === "AVAX" ? "avalanche" : "harmony",
        userAddress: withdrawAddress,
        symbol: tokenName,
        game: "8Ball",
        transferType: "withdraw",
        transactionID: "000",
        amount: withdrawAmount,
        progress: "progress",
        display: 0,
      };
      await SaveTransaction(transactionParameter);      
      wallets.push(withdrawAddress);
      withdrawAmounts.push(ethers.utils.parseEther(withdrawAmount));
      withdrawTokenNames.push(tokenName);
      if (tokenName === "ONE" || tokenName === "AVAX")
        withdrawTokens.push("0x0000000000000000000000000000000000000000");
      else withdrawTokens.push(tokenAddress);
      WithdrawVCRequests.push(WithdrawVCRequest);
      if(_tx_states === false)
      {
        _tx_states = true;
        PlayFab.settings.titleId = "1C79C";
        const loginRequest = {
          TitleId: "1C79C",
          CustomId: wallets[0],
          CreateAccount: true,
        };
        await PlayFabClient.LoginWithCustomID(loginRequest, (err, result) => {
          if (result !== {}) {
            PlayFabClient.ExecuteCloudScript(
              {
                FunctionName: "WithdrawVC",
                FunctionParameter: WithdrawVCRequests[0],
              },
              (err, result) => {
                if (result !== "") {
                  if (tx_states === false) {
                    progressingWallet = wallets.shift();
                    progressingToken = withdrawTokens.shift();
                    progressingTokenName = withdrawTokenNames.shift();
                    progressingAmount = withdrawAmounts.shift();
                    progressVCRequest = WithdrawVCRequests.shift();
                    WithdrawTransaction();
                  } else {
                    return ;
                  }
                } else if (err !== "") {
                  return;
                }
              }
            );
          }
        });
      }
    } else {
      res.status(400).json("fail");
    }
  } catch (err) {
    res.status(400).json("fail");
  }
});

const DepositTransaction = async() => {
  try{
    if(tx_states === true)
    {    
      progressingDepositVCRequest = depositVCRequests.shift();
      progressingDepositWallet = depositWallets.shift();
      progressingDepositTokenName = depositTokenNames.shift();
    }
    tx_states = true;
    PlayFab.settings.titleId = "1C79C";
    const loginRequest = {
      TitleId: "1C79C",
      CustomId: progressingDepositWallet,
      CreateAccount: true,
    };
    console.log(loginRequest);
    console.log(progressingDepositVCRequest);
    await PlayFabClient.LoginWithCustomID(loginRequest, (err, result) => {
      if (result !== {}) {
         PlayFabClient.ExecuteCloudScript(
          {
            FunctionName: "DepositVC",
            FunctionParameter: progressingDepositVCRequest,
          },
          (err,result) => {
            if (result !== "") {
              const transactionParameter = {
                net: progressingDepositTokenName === "AVAX" ? "avalanche" : "harmony",
                userAddress: progressingDepositVCRequest.WalletAddress,
                symbol: progressingDepositTokenName,
                game: "8Ball",
                transferType: "deposit",
                transactionID: "000",
                amount: progressingDepositVCRequest.inputValue,
                progress: "success",
                display: 0,
              };
              if(wallets.length > 0)
                DepositTransaction();
              else {
                tx_states = false;
                _tx_deposit_states = false;
              }
            } else if (err !== "") {
              return ;
            }
          }
        );
      }
    });
  } catch(err) {
    console.log(err);
  }
}

router.post('/deposit', async (req,res) => {
  try{
    const {transaction,DepositVCRequest,tokenName} = req.body;
    const tx = await transaction;
    res.json("deposit");
    console.log(tx);
    if(tx !== null){
      const transactionParameter = {
        net: tokenName === "AVAX" ? "avalanche" : "harmony",
        userAddress: DepositVCRequest.WalletAddress,
        symbol: tokenName,
        game: "8Ball",
        transferType: "deposit",
        transactionID: "000",
        amount: DepositVCRequest.inputValue,
        progress: "progress",
        display: 0,
      };
      await SaveTransaction(transactionParameter);  
      // depositVCRequests.push(DepositVCRequest);
      // depositWallets.push(DepositVCRequest.WalletAddress);
      // depositTokenNames.push(tokenName);
      PlayFab.settings.titleId = "1C79C";
      const loginRequest = {
        TitleId: "1C79C",
        CustomId: DepositVCRequest.WalletAddress,
        CreateAccount: true,
      };
      await PlayFabClient.LoginWithCustomID(loginRequest, async (err, result) => {
      if (result !== {}) {
         PlayFabClient.ExecuteCloudScript(
          {
            FunctionName: "DepositVC",
            FunctionParameter: DepositVCRequest,
          },
          async (err,result) => {
            if (result !== "") {
              const transactionParameter = {
                net: tokenName === "AVAX" ? "avalanche" : "harmony",
                userAddress: DepositVCRequest.WalletAddress,
                symbol: tokenName,
                game: "8Ball",
                transferType: "deposit",
                transactionID: tx.hash,
                amount: DepositVCRequest.inputValue,
                progress: "success",
                display: 0,
              };
              await SaveTransaction(transactionParameter);
            } else if (err !== "") {
              return ;
            }
          }
        );
      }
    });      
    } else {
      console.log("err");
    }
  } catch(err) {
    console.log(err);
  }
})


module.exports = router;
