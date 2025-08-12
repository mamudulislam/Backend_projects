import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/Cludinary.js";

// Utility function to generate tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found for token generation");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in generateAccessAndRefreshTokens:", error);
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};
// Register User
const registerUsers = asyncHandler(async (req, res) => {
  try {
    const { username, email, fullName, password } = req.body;

    if (!username?.trim()) throw new ApiError(400, "Username is required");
    if (!email?.trim()) throw new ApiError(400, "Email is required");
    if (!fullName?.trim()) throw new ApiError(400, "Full name is required");
    if (!password?.trim()) throw new ApiError(400, "Password is required");

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) throw new ApiError(409, "User with email or username already exists");

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

    const avatarUploadResult = await uploadOnCloudinary(avatarLocalPath);
    if (!avatarUploadResult) throw new ApiError(500, "Failed to upload avatar");

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    const coverImageUploadResult = coverImageLocalPath
      ? await uploadOnCloudinary(coverImageLocalPath)
      : null;

    const user = await User.create({
      fullName,
      avatar: avatarUploadResult.secure_url,
      coverImage: coverImageUploadResult?.secure_url || "",
      email: email.toLowerCase(),
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) throw new ApiError(500, "Something went wrong while registering the user");

    return res.status(201).json(
      new ApiResponse(201, createdUser, "User registered successfully")
    );

  } catch (error) {
    console.error("Error in registerUser:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    throw error;
  }
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!username && !email) {
      throw new ApiError(400, "Username or email is required");
    }
    if (!password?.trim()) {
      throw new ApiError(400, "Password is required");
    }

    const user = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (!user) throw new ApiError(404, "User not found");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User logged in successfully"
        )
      );

  } catch (error) {
    console.error("Error in loginUser:", error);
    throw error;
  }
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      { new: true }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out"));
  } catch (error) {
    console.error("Error in logoutUser:", error);
    throw error;
  }
});

// Refresh Access Token
const refreshaccessToken  = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(401, "Invalid refresh token");

    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    console.error("Error in refreshAccessToken:", error);
    throw error;
  }
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) throw new ApiError(401, "User not authenticated");
    if (!currentPassword?.trim()) throw new ApiError(400, "Current password is required");
    if (!newPassword?.trim()) throw new ApiError(400, "New password is required");

    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
      throw new ApiError(400, "Password must be at least 8 characters long and include an uppercase letter and a number.");
    }

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const isMatch = await user.isPasswordCorrect(currentPassword);
    if (!isMatch) throw new ApiError(401, "Current password is incorrect");

    user.password = newPassword;
    user.refreshToken = null;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password updated successfully"));
  } catch (error) {
    console.error("Error in changePassword:", error);
    throw error;
  }
});

// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    throw error;
  }
});

// Update Account Details
const updateAccountDetails = asyncHandler(async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!fullName?.trim()) throw new ApiError(400, "Full name is required");
    if (!email?.trim()) throw new ApiError(400, "Email is required");

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { fullName, email },
      },
      { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
  } catch (error) {
    console.error("Error in updateAccountDetails:", error);
    throw error;
  }
});

// Update User Avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
  try {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is missing");

    const avatarUploadResult = await uploadOnCloudinary(avatarLocalPath);
    if (!avatarUploadResult) throw new ApiError(500, "Error while uploading avatar");

    await deleteFromCloudinary(req.user.avatar);

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { avatar: avatarUploadResult.secure_url },
      },
      { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
  } catch (error) {
    console.error("Error in updateUserAvatar:", error);
    throw error;
  }
});

// Update User Cover Image
const updateUserCoverImage = asyncHandler(async (req, res) => {
  try {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) throw new ApiError(400, "Cover image file is missing");

    const coverImageUploadResult = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImageUploadResult) throw new ApiError(500, "Error while uploading cover image");

    await deleteFromCloudinary(req.user.coverImage);

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { coverImage: coverImageUploadResult.secure_url },
      },
      { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully"));
  } catch (error) {
    console.error("Error in updateUserCoverImage:", error);
    throw error;
  }
});
const getUserChannelProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId || req.user?._id;
    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }

    const authUserId = req.user?._id; // Logged-in user's ID (for isSubscribed check)

    const userProfileAgg = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },

      // Lookup subscriber count
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },

      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscriptions",
        },
      },

      {
        $addFields: {
          subscribersCount: { $size: "$subscribers" },
          isSubscribed: {
            $in: [new mongoose.Types.ObjectId(authUserId), "$subscribers.subscriber"],
          },
        },
      },
      {
        $project: {
          fullName: 1,
          username: 1,
          email: 1,
          subscribers: 1, 
          subscriptions: 1,
          subscribersCount:1,
          isSubscribed:1,
          avatar:1,
          coverImage:1 
        },
      },
    ]);

    if (!userProfileAgg || userProfileAgg.length === 0) {
      throw new ApiError(404, "User channel profile not found");
    }

    const userProfile = userProfileAgg[0];

    return res
      .status(200)
      .json(new ApiResponse(200, userProfile, "User channel profile fetched successfully"));
  } catch (error) {
    throw error instanceof ApiError
      ? error
      : new ApiError(500, error.message || "Failed to fetch user channel profile");
  }
});

 const getWatchHistory = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const historyAgg = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) }
      },
      {
        $lookup: {
          from: "videos", 
          localField: "watchHistory",
          foreignField: "_id",
          as: "watchHistory",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      username: 1,
                      avatar: 1,
                      _id: 1
                    }
                  }
                ]
              }
            },
            { $unwind: "$owner" }
          ]
        }
      },
      {
        $project: {
          watchHistory: 1 
        }
      }
    ]);

    if (!historyAgg.length) {
      throw new ApiError(404, "Watch history not found");
    }

    return res.status(200).json(
      new ApiResponse(200, historyAgg[0].watchHistory, "Watch history fetched successfully")
    );
  } catch (error) {
    throw error instanceof ApiError
      ? error
      : new ApiError(500, error.message || "Failed to fetch watch history");
  }
});

export {
  registerUsers,
  loginUser,
  logoutUser,
  refreshaccessToken ,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
};
