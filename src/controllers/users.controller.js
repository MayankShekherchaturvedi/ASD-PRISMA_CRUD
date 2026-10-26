const usersService = require('../services/users.service');
const { getPagination } = require('../utils/pagination');

exports.create = async (req, res) => {
    try {
        const { username, email, fullname, bio } = req.body;
        if (!username || !email || !fullname) {
            return res.status(400).json({ error: "username, email and fullname are required" });
        }
        const user = await usersService.createUser({ username, email, fullname, bio });
        res.status(201).json(user);
    } catch (error) {
        if (error.code === 'P2002') return res.status(409).json({ error: "username or email already taken" });
        res.status(500).json({ error: "Server error" });
    }
};

exports.list = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { sortBy = 'createdAt', order = 'desc', isPrivate, search, hasPosts } = req.query;

        if (!['createdAt', 'username', 'fullname'].includes(sortBy)) {
            return res.status(400).json({ error: "sortBy must be one of: createdAt, username, fullname" });
        }
        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).json({ error: "order must be asc or desc" });
        }
        if (isPrivate !== undefined && isPrivate !== 'true' && isPrivate !== 'false') {
            return res.status(400).json({ error: "isPrivate must be true or false" });
        }
        if (hasPosts !== undefined && hasPosts !== 'true' && hasPosts !== 'false') {
            return res.status(400).json({ error: "hasPosts must be true or false" });
        }

        const { data, total } = await usersService.listUsers({
            skip, limit, sortBy, order, isPrivate, search, hasPosts
        });

        res.status(200).json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        if (error.message === "page and limit must be positive integers") return res.status(400).json({ error: error.message });
        res.status(500).json({ error: "Server error" });
    }
};

exports.getOne = async (req, res) => {
    const user = await usersService.getUserById(Number(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
};

exports.update = async (req, res) => {
    try {
        const { fullname, bio, isPrivate } = req.body;
        const user = await usersService.updateUser(Number(req.params.id), { fullname, bio, isPrivate });
        res.status(200).json(user);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: "User not found" });
        res.status(500).json({ error: "Server error" });
    }
};

exports.remove = async (req, res) => {
    try {
        await usersService.deleteUser(Number(req.params.id));
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: "User not found" });
        res.status(500).json({ error: "Server error" });
    }
};

exports.listUserPosts = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const userId = Number(req.params.id);
        const user = await usersService.getUserById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const { data, total } = await usersService.getUserPosts(userId, skip, limit);
        res.status(200).json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        if (error.message === "page and limit must be positive integers") return res.status(400).json({ error: error.message });
        res.status(500).json({ error: "Server error" });
    }
};

exports.listLikedPosts = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const userId = Number(req.params.id);
        const user = await usersService.getUserById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const { data, total } = await usersService.getUserLikedPosts(userId, skip, limit);
        res.status(200).json({ data, meta: { page, limit, total, totalPages: total === 0 ? 0 : Math.ceil(total / limit) } });
    } catch (error) {
        if (error.message === "page and limit must be positive integers") return res.status(400).json({ error: error.message });
        res.status(500).json({ error: "Server error" });
    }
};