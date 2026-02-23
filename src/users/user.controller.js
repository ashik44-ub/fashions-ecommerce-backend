const generateToken = require("../middleware/generateToken");
const { successResponse, errorResponse } = require("../utilis/responseHandler");
const User = require("./user.model");


const userRegistration = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        const newUser = new User({
            username, email, password
        });
        await newUser.save();
        res.status(200).send({ message: "Registration Successful!" });
    } catch (error) {
        res.status(500).send({ message: "Registration Failed!" });
    }
}

const userLoggedIn = async(req, res)=>  {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).send({message: "user not found"});
        }
        //compares pasword model  a giye define kore dite hobe
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).send({message: "invalid user password"});
        }

        //token generate
        const token = await generateToken(user._id);
        //set cookie front of the website
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        })
        res.status(200).send({
            message: "Logged in succesfull",
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profileprofileImage: user.profileImage,
                bio: user.bio,
                profession: user.profession
            }
        })


    } catch (error) {
        console.error("Error Login User", error);
        res.status(500).send({message: "Login failed"})
    }
}

const userlogout = async (req, res) => {
    try {
        // 1. Clear the cookie by name
        // Use the same options (path, domain) used when setting it
        res.clearCookie("token", {
            httpOnly: true,
            secure: true, 
            sameSite: "None" // Match your frontend/backend setup
        });

        //return res.status(200).send({ message: "Logged out successfully" });
        successResponse(res, 200, "Logged Out Successfull")
    } catch (error) {
        // console.error("Error logging out backend", error);
        // res.status(500).send({ message: "Failed to log out" });
        errorResponse(res, 500, "Logged Out Failed", error)
    }
}

const getAllUsers = async (req, res) => {
  try {
    const users =  await User.find({}, 'email role').sort({createdAt: -1});
    successResponse(res, 200, "All users fetched successfully!", data= users)
  } catch (error) {
    errorResponse(res, 500, "Failed to fetch all users!", error);
  }
};

const deleteUser = async (req, res) => {

  const {id} = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if(!user) {
      return errorResponse(res, 404, "User not found!");
    }
    
    return successResponse(res, 200, "Users deleted successfully!")
  } catch (error) {
    errorResponse(res, 500, "Failed to delete user!", error);
  }
}

const updateUserRole = async(req, res) => {
    const {id} = req.params;
    const {role} = req.body;

    try {
        const updatedUser =  await User.findByIdAndUpdate(id, {role}, {new: true});
        if (!updatedUser) {
            return errorResponse(res, 404, "User not found");
        }   
        return successResponse(res, 200, "User Role Updated Successful");
    } catch (error) {
         return errorResponse(res, 500, "User UPdate Failed", error);
    }
}

const editUserProfile = async (req, res) => {
    const {id} = req.params;
    const {username, profileImage, bio, profession} = req.body;
    try {
        const updateFields = {
            username,
            profileImage,
            bio,
            profession
        }
        const updateUser = await User.findByIdAndUpdate(id, updateFields, {new: true});
        if (!updateUser) {
            return errorResponse(res, 404, "User not found");
        }
        return successResponse(res, 200, "User Profile Updated Successful");
    } catch (error) {
        return errorResponse(res, 500, "Failed to update user profile", error);
    }
}

module.exports = {
    userRegistration,
    userLoggedIn,
    userlogout,
    getAllUsers,
    deleteUser,
    updateUserRole,
    editUserProfile
}