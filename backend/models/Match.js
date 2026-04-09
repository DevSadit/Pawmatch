// =============================================
// Match Model
// =============================================

const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    action: {
      type: String,
      enum: ["liked", "super-liked"],
      default: "liked",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.user = ret.user ? ret.user.toString() : ret.user;
        delete ret.__v;
        return ret;
      },
    },
  }
);

matchSchema.index({ user: 1, pet: 1 }, { unique: true });

module.exports = mongoose.model("Match", matchSchema);
