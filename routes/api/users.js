const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const speakeasy = require("speakeasy");
const fs = require("fs");
const path = require( "path" );
const { PlayFab, PlayFabClient } = require("playfab-sdk");

// @route   get api/users/test
// @desc    test User
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "this is test" }));

// @route   POST api/users
// @desc    Register User
// @access  Public
router.post("/", async (req, res) => {
  try {
    const { userAddress } = req.body;
    let user = await User.findOne({ userAddress });
    if (user) {
      return res.json(user);
    } else {
      qrCheck = 0;
      user = new User({
        userAddress,
        qrCheck,
      });
      user.save();
      return res.json(user);
    }
  } catch (err) {
    console.error(err);
  }
});

// @route   POST api/users/addPlayFabId
// @desc    Register User
// @access  Public
router.post("/addPlayFabId", async (req, res) => {
  try {
    const { userAddress, playFabId } = req.body;
    let user = await User.findOne({ userAddress });
    if (user) {
      user.playFabId = playFabId;
      user.save();
    } else {
      return res.json("Please connect Wallet");
    }
  } catch (err) {}
});

// @route   POST api/users/qrcode
// @desc    Register User qrcode
// @access  Public
router.post("/qrCode", async (req, res) => {
  try {
    const { userAddress, userhex } = req.body;
    let user = await User.findOne({ userAddress });
    if (user) {
      if (user.check === 1) return res.json(0);
      else {
        user.qrCheck = 1;
        user.userhex = userhex;
        user.save();
        return res.json(1);
      }
    }
  } catch (err) {
    console.error(err);
  }
});

// @route   POST api/users/checkQrCode
// @desc    check User qrcode
// @access  Public
router.post("/checkQrCode", async (req, res) => {
  try {
    const { userAddress } = req.body;
    let user = await User.findOne({ userAddress });
    if (user) {
      return res.json(user.qrCheck);
    } else {
      return res.json(0);
    }
  } catch (err) {
    console.error(err);
  }
});

// @route   POST api/users/verifycode
// @desc    check verify qrcode
// @access  Public
router.post("/verifyCode", async (req, res) => {
  try {
    const { userAddress, checkCode } = req.body;
    let user = await User.findOne({ userAddress });
    if (user) {
      if (user.qrCheck === 1) {
        const isVerified = speakeasy.totp.verify({
          secret: user.userhex,
          encoding: "hex",
          token: checkCode,
          window: 1,
        });
        return res.json(isVerified);
      }
    }
  } catch (err) {
    console.error(err);
  }
});

// @route   POST api/users/username
// @desc    check verify qrcode
// @access  Public
router.post("/editProfile", async (req, res) => {
    try {
        const {id,name,email,bio} = req.body;
        const user = await User.findById(id);
        user.name = name;
        if(email !== null && email !=="")
            user.email = email;
        if(bio !== null)
            user.bio = bio;
        if(req.files !== null)
        {
            fs.copyFileSync( req.files.avatar.tempFilePath, path.join(__dirname, `../../storage/avatar`, req.body.id ));
            user.avatar = `/avatar/${req.body.id}`
        }
        user.save();
        res.json({success: true});
    } catch(err) {
        console.error(err);
    }
});

router.post('/createTeamPlayfabId',async(req,res) => {
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

module.exports = router;
