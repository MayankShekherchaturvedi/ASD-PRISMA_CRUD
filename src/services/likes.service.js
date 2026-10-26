const prisma = require('../db');

exports.createLike = (data) => prisma.like.create({ data });

exports.deleteLike = (userId, postId) => prisma.like.delete({
    where: { userId_postId: { userId, postId } }
});