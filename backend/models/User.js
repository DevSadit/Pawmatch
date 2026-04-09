// =============================================
// User Model
// =============================================

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatar:   { type: String, default: "" },
    preferences: {
      petType:  { type: String, default: "" },
      energy:   { type: String, default: "" },
      homeType: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret.__v;
        delete ret.password;
        delete ret.role;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("User", userSchema);
