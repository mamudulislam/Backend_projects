import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/Cludinary.js";
import jwt from "jsonwebtoken";

// Generate tokens
const generateAccessAndRefershTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

// Register User
const registerUsers = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;

  if (!username?.trim()) throw new ApiError(400, "Username is required");
  if (!email?.trim()) throw new ApiError(400, "Email is required");
  if (!fullName?.trim()) throw new ApiError(400, "Full name is required");
  if (!password?.trim()) throw new ApiError(400, "Password is required");

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // File upload
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatarUploadResult = await uploadOnCloudinary(avatarLocalPath);
  const coverImageUploadResult = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatarUploadResult) {
    throw new ApiError(500, "Failed to upload avatar to Cloudinary");
  }

  const user = await User.create({
    fullName,
    avatar: avatarUploadResult.secure_url,
    coverImage: coverImageUploadResult?.secure_url || "",
    email: email.toLowerCase(),
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(email || username) || !password) {
    throw new ApiError(400, "Username/email and password are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefershTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully")
    );
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  };

  res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Refresh Access Token
const refreshaccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or does not match");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefershTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed")
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    if (!currentPassword?.trim()) {
      throw new ApiError(400, "Current password is required");
    }

    if (!newPassword?.trim()) {
      throw new ApiError(400, "New password is required");
    }

    // Optional: Password strength validation
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
      throw new ApiError(400, "Password must be at least 8 characters long and include an uppercase letter and a number.");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isMatch = await user.isPasswordCorrect(currentPassword);
    if (!isMatch) {
      throw new ApiError(401, "Current password is incorrect");
    }

    user.password = newPassword;
    user.refreshToken = null; // Optional: logout from all devices
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password updated successfully"));
  } catch (error) {
    console.error("Error in changePassword:", error);
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Something went wrong while changing password"
    );
  }
});

// Get Current Authenticated User
const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User fetched successfully"));
  } catch (error) {
    // You can log the error here if needed
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Something went wrong while fetching the user"
    );
  }
});

// update Account Details
const updateAccountDetails = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) throw new ApiError(401, "User not authenticated");

    const { username, email, fullName } = req.body;

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    if (username?.trim() && username.toLowerCase() !== user.username) {
      const userConflict = await User.findOne({ username: username.toLowerCase(), _id: { $ne: userId } });
      if (userConflict) throw new ApiError(409, "Username is already taken");
      user.username = username.toLowerCase();
    }

    if (email?.trim() && email.toLowerCase() !== user.email) {
      const emailConflict = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
      if (emailConflict) throw new ApiError(409, "Email is already taken");
      user.email = email.toLowerCase();
    }

    if (fullName?.trim()) {
      user.fullName = fullName;
    }

    if (req.files?.avatar?.[0]?.path) {
      const avatar = req.files.avatar[0];
      const avatarUpload = await uploadOnCloudinary(avatar.path);

      if (!avatarUpload) throw new ApiError(500, "Failed to upload avatar");

      user.avatar = avatarUpload.secure_url;
    }

    if (req.files?.coverImage?.[0]?.path) {
      const cover = req.files.coverImage[0];
      const coverUpload = await uploadOnCloudinary(cover.path);

      if (!coverUpload) throw new ApiError(500, "Failed to upload cover image");

      user.coverImage = coverUpload.secure_url;
    }

    await user.save();

    const updatedUser = await User.findById(userId).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, updatedUser, "Account details updated successfully"));
  } catch (error) {
    console.error("Error updating account details:", error);
    if (error instanceof ApiError) {
      throw error;
    } else {
      throw new ApiError(500, error.message || "Failed to update account details");
    }
  }
});



// Export all handlers
export {
  registerUsers,
  loginUser,
  logoutUser,
  refreshaccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails 
};