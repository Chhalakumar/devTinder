const express = require("express");
const userRouter = express.Router();
const {userauth} = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const user = require("../models/user");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

//get all the pending connection requests for the logged in user
userRouter.get("/user/requests/received",userauth,async(req,res)=>{
  try{
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
        toUserId:loggedInUser._id,
        status:"interested",
    }).populate("fromUserId",USER_SAFE_DATA ); 
    // }).populate("fromUserId",["firstName","lastName"]);

    // Filter out requests where the sender user was deleted
    const validRequests = connectionRequests.filter(request => request.fromUserId);

    res.json({
        message:"data fetched succesfully",
        data:validRequests,
    });
  }catch(err){
    res.status(400).send("ERROR : " + err.message);
  }
});

userRouter.get("/user/connections",userauth,async(req,res)=>{
    try{
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find({
            $or:[
                {fromUserId:loggedInUser._id, status:"accepted"},
                {toUserId:loggedInUser._id, status:"accepted"},
            ],
        }).populate("fromUserId",USER_SAFE_DATA )
              .populate("toUserId", USER_SAFE_DATA);


        const data = connectionRequests
            .filter((row)=>{
                // Filter out connections where either user was deleted
                return row.fromUserId && row.toUserId;
            })
            .map((row)=>{
                if(row.fromUserId._id.toString() === loggedInUser._id.toString()){
                    return row.toUserId;
                }else{
                    return row.fromUserId;
                }
            });
        res.json({
            data,
        });
    }catch(err){
        res.status(400).send("ERROR : " + err.message);
    }
});

userRouter.get("/feed",userauth,async(req,res)=>{
    try{
        const loggedInUser = req.user;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;
        const connectionRequest = await ConnectionRequest.find({
            $or:[{fromUserId:loggedInUser._id},{toUserId:loggedInUser._id}],
        }).select("fromUserId toUserId");

        const hideUserFromFeed = new Set();
        connectionRequest.forEach((req)=>{
            hideUserFromFeed.add(req.fromUserId.toString());
            hideUserFromFeed.add(req.toUserId.toString());
        });

        const users = await User.find({
            $and:[
                {_id:{$ne:loggedInUser._id}},
                {_id:{$nin:Array.from(hideUserFromFeed)}},
            ],
        }).select(USER_SAFE_DATA)
        .skip(skip)
        .limit(limit);

        res.send(users);
    }catch(err){
        res.status(400).send("ERROR : " + err.message);
    }
})
module.exports = userRouter;