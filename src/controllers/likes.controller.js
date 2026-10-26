const likesService = require('../services/likes.service');
const postsService = require('../services/posts.service');

exports.create = async (req, res) => {
    try {
        const { userId } = req.body;
        const postId = Number(req.params.id);

        if (!userId) return res.status(400).json({ error: "userId is required" });

        const post = await postsService.getPostById(postId);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const like = await likesService.createLike({ userId, postId });
        res.status(201).json(like);
    } catch (error) {
        if (error.code === 'P2003') return res.status(404).json({ error: "User not found" });
        if (error.code === 'P2002') return res.status(409).json({ error: "Already liked" });
        res.status(500).json({ error: "Server error" });
    }
};

exports.remove = async (req, res) => {
    try {
        const postId = Number(req.params.id);
        const userId = Number(req.params.userId);
        await likesService.deleteLike(userId, postId);
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: "Like not found" });
        res.status(500).json({ error: "Server error" });
    }
};