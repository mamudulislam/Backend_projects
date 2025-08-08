import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/Cludinary.js";

const registerUsers = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;

  // Field-by-field validation
  if (!username?.trim()) throw new ApiError(400, "Username is required");
  if (!email?.trim()) throw new ApiError(400, "Email is required");
  if (!fullName?.trim()) throw new ApiError(400, "Full name is required");
  if (!password?.trim()) throw new ApiError(400, "Password is required");

  // Check if user exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Handle file uploads from multer
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload to Cloudinary
  const avatarUploadResult = await uploadOnCloudinary(avatarLocalPath);
  const coverImageUploadResult = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatarUploadResult) {
    throw new ApiError(500, "Failed to upload avatar to Cloudinary");
  }

  // Save user
  const user = await User.create({
    fullName,
    avatar: avatarUploadResult.secure_url,
    coverImage: coverImageUploadResult?.secure_url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Remove sensitive fields before sending response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export { registerUsers };