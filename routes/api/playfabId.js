const express = require("express");
const router = express.Router();
const { PlayFab, PlayFabClient } = require("playfab-sdk");

router.post('/create8BallTeamPlayfabId',async(req,res) => {
  try{
    const {teamName} = req.body;
    PlayFab.settings.titleId = "1C79C";
    const loginRequest = {
      TitleId: PlayFab.settings.titleId,
      CustomId: teamName,
      CreateAccount: true,
    };
    PlayFabClient.LoginWithCustomID(loginRequest, (err, result) => {
      if (result !== {}) {
        return res.json(result.data.PlayFabId);
      } else if (err !== {}) {
        return res.status(400).json(err);
      }
    });

  }catch(err){
    return res.status(404).json(err);
  }
});

router.post("/deposit",async(req,res) => {
  const {DepositVCRequest} = req.body;
  PlayFab.settings.titleId = "1C79C";
  const loginRequest = {
    TitleId: "1C79C",
    CustomId: DepositVCRequest.WalletAddress,
    CreateAccount: true,
  };
  PlayFabClient.LoginWithCustomID(loginRequest, (err, result) => {
    if (result !== {}) {
      PlayFabClient.ExecuteCloudScript(
        {
          FunctionName: "DepositVC",
          FunctionParameter: DepositVCRequest
        },
        (err,result) => {
          if (result !== "") {
            return res.json("success");
          } else if (err !== "") {
            return res.status(400).json("fail");
          }
        }
      )
    } else if (err !== {}) {
      return res.status(400).json(err);
    }
  });
  
});

router.post("/withdraw",async(req,res) => {
  const {DepositVCRequest} = req.body;
  PlayFab.settings.titleId = "1C79C";
  const loginRequest = {
    TitleId: "1C79C",
    CustomId: DepositVCRequest.WalletAddress,
    CreateAccount: true,
  };
  PlayFabClient.LoginWithCustomID(loginRequest, (err, result) => {
    if (result !== {}) {
      PlayFabClient.ExecuteCloudScript(
        {
          FunctionName: "DepositVC",
          FunctionParameter: DepositVCRequest
        },
        (err,result) => {
          if (result !== "") {
            return res.json("success");
          } else if (err !== "") {
            return res.status(400).json("fail");
          }
        }
      )
    } else if (err !== {}) {
      return res.status(400).json(err);
    }
  });
  
});

module.exports = router;
