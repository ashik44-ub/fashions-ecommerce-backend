const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt"); // <--- THIS WAS MISSING

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: String,
  bio: { type: String, maxlength: 200 }, // <--- Fixed typo here
  profession: String,
  role: {
    type: String,
    default: 'user'
  },
  createdAt: { type: Date, default: Date.now }
});

// hash password
// 1. Remove 'next' from the arguments
userSchema.pre('save', async function() {
    const user = this;

    // 2. Just return if the password hasn't changed
    if (!user.isModified('password')) return;

    try {
        // 3. Hash the password
        const hashPassword = await bcrypt.hash(user.password, 10);
        user.password = hashPassword;
        
        // 4. No next() needed. Mongoose knows you're done when the function ends.
    } catch (error) {
        throw error; // This passes the error to your controller's catch block
    }
});

// comapre password

userSchema.methods.comparePassword = function (candidatePassword){
  return bcrypt.compare(candidatePassword, this.password)
}

const User = model('User', userSchema);
module.exports = User;