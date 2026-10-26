const prisma = require('../src/db');
const { users, posts, likes } = require('./seed-data');

async function main() {
    try {
        await prisma.like.deleteMany();
        await prisma.post.deleteMany();
        await prisma.user.deleteMany();

        const createdUsers = await prisma.user.createManyAndReturn({ data: users });
        const userMap = new Map(createdUsers.map(u => [u.username, u.id]));

        const mappedPosts = posts.map(p => {
            const { author, ...postData } = p;
            return { ...postData, authorId: userMap.get(author) };
        });

        const createdPosts = await prisma.post.createManyAndReturn({ data: mappedPosts });
        const postMap = new Map(createdPosts.map(p => {
            const instaKey = p.imageUrl.split('/')[4];
            return [instaKey, p.id];
        }));

        const mappedLikes = likes.map(l => ({
            userId: userMap.get(l.user),
            postId: postMap.get(l.post)
        }));

        const createdLikes = await prisma.like.createManyAndReturn({ data: mappedLikes });

        console.log(`🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.length} likes`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}
main();