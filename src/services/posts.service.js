const prisma = require('../db');

const userSummary = { id: true, username: true, fullname: true };

exports.createPost = (data) => prisma.post.create({ data });

exports.listPosts = async ({ skip, limit, sortBy, order, location, search, from, to }) => {
    const where = {};
    if (location) where.location = location;
    if (search) where.caption = { contains: search };

    if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lt = new Date(to);
    }

    let orderBy;
    if (sortBy === 'likes') {
        orderBy = [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }];
    } else {
        orderBy = { [sortBy]: order };
    }

    const [data, total] = await prisma.$transaction([
        prisma.post.findMany({
            where, skip, take: limit, orderBy,
            include: { author: { select: userSummary }, _count: { select: { likes: true } } }
        }),
        prisma.post.count({ where })
    ]);
    return { data, total };
};

exports.getPostById = (id) => prisma.post.findUnique({
    where: { id },
    include: { author: { select: userSummary }, _count: { select: { likes: true } } }
});

exports.updatePost = (id, data) => prisma.post.update({ where: { id }, data });

exports.deletePost = (id) => prisma.post.delete({ where: { id } });

exports.getPostLikes = async (postId) => {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
            likes: {
                include: { user: { select: userSummary } },
                orderBy: { user: { username: 'asc' } }
            }
        }
    });
    return post ? post.likes.map(l => l.user) : null;
};