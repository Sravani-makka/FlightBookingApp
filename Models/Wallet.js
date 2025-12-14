const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    unique: true 
  },
  balance: { 
    type: Number, 
    default: 50000   // ✅ starting balance as per assignment
  }
});

module.exports = mongoose.model("Wallet", WalletSchema);