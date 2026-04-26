// =============================================
// Community Post Model
// =============================================

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true, maxlength: 500 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.userId = ret.userId ? ret.userId.toString() : ret.userId;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const postSchema = new mongoose.Schema(
  {
    content:    { type: String, required: true },
    authorId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, default: "Anonymous" },
    image:      { type: String, default: "" },
    likes:      { type: Number, default: 0 },
    likedBy:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    guestLikedBy: [{ type: String }],
    comments:   { type: [commentSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.authorId = ret.authorId ? ret.authorId.toString() : ret.authorId;
        ret.likedBy = (ret.likedBy || []).map((id) => id.toString());
        ret.guestLikedBy = ret.guestLikedBy || [];
        ret.comments = (ret.comments || []).map((comment) => {
          const c = comment.toJSON ? comment.toJSON() : comment;
          return c;
        });
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("Post", postSchema);
