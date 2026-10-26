const postsService = require('../services/posts.service');
const { getPagination } = require('../utils/pagination');

exports.create = async (req, res) => {
    try {
        const { imageUrl, caption, location, authorId } = req.body;
        if (!imageUrl || !authorId) {
            return res.status(400).json({ error: "imageUrl and authorId are required" });
        }
        const post = await postsService.createPost({ imageUrl, caption, location, authorId });
        res.status(201).json(post);
    } catch (error) {
        if (error.code === 'P2003') return res.status(404).json({ error: "User not found" });
        res.status(500).json({ error: "Server error" });
    }
};

exports.list = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { sortBy = 'createdAt', order = 'desc', location, search, from, to } = req.query;

        if (!['createdAt', 'updatedAt', 'likes'].includes(sortBy)) {
            return res.status(400).json({ error: "sortBy must be one of: createdAt, updatedAt, likes" });
        }
        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).json({ error: "order must be asc or desc" });
        }
        if ((from && isNaN(Date.parse(from))) || (to && isNaN(Date.parse(to)))) {
            return res.status(400).json({ error: "from and to must be valid dates" });
        }

        const { data, total } = await postsService.listPosts({ skip, limit, sortBy, order, location, search, from, to });
        res.status(200).json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        if (error.message === "page and limit must be positive integers") return res.status(400).json({ error: error.message });
        res.status(500).json({ error: "Server error" });
    }
};

exports.getOne = async (req, res) => {
    const post = await postsService.getPostById(Number(req.params.id));
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.status(200).json(post);
};

exports.update = async (req, res) => {
    try {
        const { caption, location } = req.body;
        const post = await postsService.updatePost(Number(req.params.id), { caption, location });
        res.status(200).json(post);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: "Post not found" });
        res.status(500).json({ error: "Server error" });
    }
};

exports.remove = async (req, res) => {
    try {
        await postsService.deletePost(Number(req.params.id));
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: "Post not found" });
        res.status(500).json({ error: "Server error" });
    }
};

exports.getLikes = async (req, res) => {
    const likes = await postsService.getPostLikes(Number(req.params.id));
    if (!likes) return res.status(404).json({ error: "Post not found" });
    res.status(200).json(likes);
};