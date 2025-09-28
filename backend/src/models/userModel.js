import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email:    { type: String, required: true, unique: true },
  password: { type: String },
  phoneNumber: { type: String, default: "" },
  streetAddress: { type: String, default: "" },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  zipCode: { type: String, default: "" },
  googleId: {
    type: String,
  },
});

const User = mongoose.model('User', userSchema);

export default User;