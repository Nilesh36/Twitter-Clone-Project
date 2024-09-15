import { Tweet } from "../models/tweetSchema.js"
import { User } from "../models/userSchema.js";

export const createTweet = async (req, res) => {
    try {
        const {description, id} = req.body;
        if(!description || !id) {
            return res.status(401).json({
                message:"Fields are required",
                success:false
            })
        };
        const user = await User.findById(id).select("-password");
        await Tweet.create({
            description,
            userId: id,
            userDetails:user
        })
        return res.status(201).json({
            message:"Tweet created successfully",
            success: true
        })
    } catch (error) {
        console.log(error);
        
    }
}


export const deleteTweet = async (req, res) => {
    try {
        const {id} = req.params;
        await Tweet.findByIdAndDelete(id);
        return res.status(200).json({
            message:"Tweet deleted successfully",
            success: true
        })
    } catch (error) {
        console.log(error);
        
    }
}

export const likeOrDislike = async (req, res) => {
    try {
        const loggedInUser = req.body.id;
        const tweetId = req.params.id;
        const tweet = await Tweet.findById(tweetId);
        if(tweet.like.includes(loggedInUser)){
            //dislike
            await Tweet.findByIdAndUpdate(tweetId, {$pull:{like:loggedInUser}});
            return res.status(200).json({
                message:"User disliked your tweet",
                success: true
            })
        }else{
            //like
            await Tweet.findByIdAndUpdate(tweetId, {$push:{like:loggedInUser}});
            return res.status(200).json({
                message:"User liked your tweet",
                success: true
            })
        }
    } catch (error) {
        console.log(error);
        
    }
}

export const getAllTweets = async (req, res) => {
    //loggedInUser ka tweets + following users tweets
    try {
        const id = req.params.id;
        const loggedInUser = await User.findById(id);
        const loggedInUserTweets = await Tweet.find({userId:id});
        const followingUsersTweets = await Promise.all(loggedInUser.following.map((otherUsersId) => {
            return Tweet.find({userId:otherUsersId})
        }))
        return res.status(200).json({
            tweets: [...loggedInUserTweets,...followingUsersTweets.flat()],
            success: true
        })

    } catch (error) {
        
    }
}

export const getFollowingTweets = async (req, res) => {
    try {
        const id = req.params.id;
        const loggedInUser = await User.findById(id);
        const followingUsersTweets = await Promise.all(loggedInUser.following.map((otherUsersId) => {
            return Tweet.find({userId:otherUsersId})
        }))
        return res.status(200).json({
            tweets: [...followingUsersTweets.flat()],
            success: true
        })

    } catch (error) {
        console.log(error);
        
    }
}