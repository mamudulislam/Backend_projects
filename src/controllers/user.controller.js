import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { cloudinary } from "../utils/Cludinary.js";
const registerUsers = asyncHandler(async (req, res) => {

    //  get user detailes form frontend 
    //  validation -not empty
    //  check if user alrady exites: username, email
    //  chack for img, check for avatar
    //  upload them to cludinary, avatar
    //  create users obj - create entry in db 
    //  removed password and refresh token field form response
    //  check for user creation 
    //  return res  
    
    const {username, email, fullName, password} = req.body
    console.log(email,password)
     
    if (
        [username, email, fullName, password].some((field) => 
            field?.trim() === "")
    ) {
        throw new ApiError(400, "ALL fields are required")
    }
    
    const existeUser = User.findOne({
        $or:[
            {username}, {email}
        ]
    })


    if(existeUser) {
        throw new ApiError(409, "User with email or username already exists!")
    } 

    const avatarLocalpath = req.files?.avatar[0]?.path;
    const coverImageLocalpath = req.files?. coverImage[0]?.path;
    
    if(!avatarLocalpath){
        throw new ApiError (400, "avatar file is required!")
    }

    const avatar = await cloudinary(avatarLocalpath)
    const coverImage = await cloudinary(coverImageLocalpath)
   
    if (!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create(
        {
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        }
    )
     
    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createUser){
        throw new ApiError(500, "Something went wrong while registering the user!")
    }

    return res.status(201).json(
        new ApiResponse(200, createUser, "User registerd Successfully")
    )
});

export { registerUsers }
