const express = require('express');
const router = express.Router();
const { UserModel } = require('../models/Users');
const protect = require('../middleware/AuthMiddleware');
const { requireOwnUser } = require('../middleware/AuthMiddleware');

const SAFE_USER_FIELDS = '_id firstName lastName email phone address verified';

router.get("/getUser/:id", protect, requireOwnUser, async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id).select(SAFE_USER_FIELDS);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json(user);
    } catch (err) {
        return res.status(500).json({ message: 'Failed to retrieve user' });
    }
});

router.put("/updatkeUser/:id", protect, requireOwnUser, async (req, res) => {
    try {
        const { firstName, lastName, phone, address } = req.body;
        const user = await UserModel.findByIdAndUpdate(
            req.params.id,
            { firstName, lastName, phone, address },
            { new: true }
        ).select(SAFE_USER_FIELDS);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json(user);
    } catch (err) {
        return res.status(500).json({ message: 'Failed to update user' });
    }
});

router.delete("/deleteUser/:id", protect, requireOwnUser, async (req, res) => {
    try {
        const user = await UserModel.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({ message: 'User deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to delete user' });
    }
});

router.get('/countAllUsers', protect, async (req, res) => {
    try {
        const userCount = await UserModel.countDocuments();
        res.status(200).json({ count: userCount });
    } catch (err) {
        res.status(500).json({ error: 'Failed to count users' });
    }
});

router.get('/user', protect, async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.user.email })
            .select('_id firstName lastName phone address')
            .lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            id: user._id,
            firstname: user.firstName,
            lastname: user.lastName,
            phone: user.phone,
            address: user.address,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to retrieve user' });
    }
});

module.exports = router;
