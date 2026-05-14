import User from "../models/User.mjs";

const makeMeAdmin = async (req, res) => {
    try {
        // req.user بييجي من الـ verifyJWT middleware (وهو عبارة عن الـ ID بتاع اليوزر)
        const userId = req.user; 

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // بندور على اليوزر ونحدث الـ role بتاعه لـ admin
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { role: "admin" },
            { new: true } // عشان يرجع بيانات اليوزر بعد التعديل
        ).select("-password"); // بنشيل الباسورد عشان ميرجعش في الرد

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "Success! You are now an admin.", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export default makeMeAdmin;