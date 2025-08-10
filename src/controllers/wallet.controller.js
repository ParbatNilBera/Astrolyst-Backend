const User = require("../models/user.model");

// Add money to wallet
const addMoney = async (req, res) => {
  try {
    const userId = req.user._id; // Authenticated user
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wallet.balance += amount;
    await user.save();

    return res.status(200).json({
      message: `₹${amount} added to wallet successfully`,
      balance: user.wallet.balance,
    });
  } catch (error) {
    console.error("addMoney error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addMoney,
};
