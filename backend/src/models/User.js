const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
      type: String,
      enum: ['user', 'developer'],
      default: 'user'
    },
    avatar: {
      type: String,
      default: ''
    },
    googleId: {
      type: String,
      sparse: true
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    zerodhaUserId: {
      type: String,
      default: ''
    },
    zerodhaAccessToken: {
      type: String,
      default: ''
    },
    lastLoginAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare input password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Exclude sensitive password field when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
