const prisma = require('../db');

exports.createUser = (data) => prisma.user.create({ data });

exports.listUsers = async ({ skip, limit, sortBy, order, isPrivate, search, hasPosts }) => {
    const where = {};
    if (isPrivate !== undefined) where.isPrivate = isPrivate === 'true';
    if (search) {
        where.OR = [
            { username: { contains: search } },
            { fullname: { contains: search } }
        ];
    }
    if (hasPosts !== undefined) {
        where.posts = hasPosts === 'true' ? { some: {} } : { none: {} };
    }

    const [data, total] = await prisma.$transaction([
        prisma.user.findMany({ where, skip, take: limit, orderBy: { [sortBy]: order } }),
        prisma.user.count({ where })
    ]);
    return { data, total };
};

exports.getUserById = (id) => prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { posts: true, likes: true } } }
});

exports.updateUser = (id, data) => prisma.user.update({ where: { id }, data });

exports.deleteUser = (id) => prisma.user.delete({ where: { id } });

exports.getUserPosts = async (authorId, skip, limit) => {
    const where = { authorId };
    const [data, total] = await prisma.$transaction([
        prisma.post.findMany({
            where, skip, take: limit, orderBy: { createdAt: 'desc' },
            include: { _count: { select: { likes: true } } }
        }),
        prisma.post.count({ where })
    ]);
    return { data, total };
};

exports.getUserLikedPosts = async (userId, skip, limit) => {
    const where = { likes: { some: { userId } } };
    const [data, total] = await prisma.$transaction([
        prisma.post.findMany({
            where, skip, take: limit, orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { id: true, username: true, fullname: true } },
                _count: { select: { likes: true } }
            }
        }),
        prisma.post.count({ where })
    ]);
    return { data, total };
};