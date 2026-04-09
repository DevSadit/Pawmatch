// =============================================
// Community Post Model
// =============================================

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content:    { type: String, required: true },
    authorId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, default: "Anonymous" },
    image:      { type: String, default: "" },
    likes:      { type: Number, default: 0 },
    likedBy:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.authorId = ret.authorId ? ret.authorId.toString() : ret.authorId;
        ret.likedBy = (ret.likedBy || []).map((id) => id.toString());
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("Post", postSchema);
