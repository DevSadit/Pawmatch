// =============================================
// Pet Model
// =============================================

const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    type:        { type: String, required: true, trim: true },
    breed:       { type: String, required: true, trim: true },
    age:         { type: String, default: "Unknown" },
    gender:      { type: String, default: "Unknown" },
    location:    { type: String, default: "Unknown" },
    status:      { type: String, required: true, enum: ["Adoption", "Sale", "Rehome"] },
    price:       { type: Number, default: 0 },
    vaccinated:  { type: Boolean, default: false },
    description: { type: String, default: "" },
    image:       { type: String, default: "https://placehold.co/400x300?text=Pet+Photo" },
    owner:       { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    energyLevel: { type: String, default: "Medium" },
    goodWithKids:{ type: Boolean, default: false },
    homeType:    { type: String, default: "Any" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        if (ret.owner && typeof ret.owner === "object") {
          ret.owner = ret.owner.toString();
        }
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("Pet", petSchema);
