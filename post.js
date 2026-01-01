// Single Post Logic

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', () => {
    if (!postId) {
        window.location.href = 'blog.html';
        return;
    }

    loadPost();
    loadComments();

    // Comment Submission
    document.getElementById('comment-form').addEventListener('submit', handleCommentSubmit);
});

async function loadPost() {
    const container = document.getElementById('post-content');

    try {
        const doc = await db.collection('posts').doc(postId).get();

        if (!doc.exists) {
            container.innerHTML = '<h2>Post not found</h2><p><a href="blog.html">Back to blog</a></p>';
            return;
        }

        const post = doc.data();
        const date = post.publishedAt ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString() : 'Unknown Date';
        const image = post.imageUrl ? `<img src="${post.imageUrl}" class="post-featured-image" alt="${post.title}">` : '';

        // Inject content
        // SECURITY NOTE: In a real app we must sanitize post.content to prevent XSS. 
        // For this portfolio, we assume the admin (user) posts safe HTML.
        container.innerHTML = `
            <div class="post-header">
                <div class="blog-category" style="margin-bottom: 0.5rem; justify-content: center; display: flex;">${post.category || 'Tech'}</div>
                <h1>${post.title}</h1>
                <div class="post-meta-full">
                    <span><i class="far fa-calendar"></i> ${date}</span>
                    <span><i class="far fa-user"></i> ${post.author || 'Mohamet Joseph'}</span>
                    <span><i class="far fa-clock"></i> ${post.readTime || '5 min'} read</span>
                </div>
            </div>
            
            ${image}
            
            <div class="post-body">
                ${post.content}
            </div>

            <div style="margin-top: 3rem; text-align: center;">
                <p>Share this article:</p>
                <div class="social-links" style="justify-content: center;">
                     <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${location.href}" target="_blank"><i class="fab fa-twitter"></i></a>
                     <a href="https://www.linkedin.com/sharing/share-offsite/?url=${location.href}" target="_blank"><i class="fab fa-linkedin"></i></a>
                </div>
            </div>
        `;

        document.title = `${post.title} | Mohamet Joseph`;

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Error loading post.</p>';
    }
}

async function loadComments() {
    const list = document.getElementById('comments-list');
    try {
        const snapshot = await db.collection('posts').doc(postId).collection('comments')
            .orderBy('timestamp', 'desc')
            .get();

        if (snapshot.empty) {
            list.innerHTML = '<p style="color: var(--text-light);">No comments yet. Be the first!</p>';
            return;
        }

        list.innerHTML = '';
        snapshot.forEach(doc => {
            const comment = doc.data();
            const div = document.createElement('div');
            div.className = 'comment';
            div.innerHTML = `
                <div class="comment-header">
                    <span>${comment.name}</span>
                    <span style="font-weight: 400; color: var(--text-light); font-size: 0.8rem;">
                        ${new Date(comment.timestamp.seconds * 1000).toLocaleDateString()}
                    </span>
                </div>
                <p>${comment.text}</p>
            `;
            list.appendChild(div);
        });

    } catch (error) {
        console.error("Error loading comments", error);
    }
}

async function handleCommentSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('comment-name').value;
    const text = document.getElementById('comment-text').value;
    const btn = e.target.querySelector('button');

    if (!name || !text) return;

    btn.disabled = true;
    btn.innerText = 'Posting...';

    try {
        await db.collection('posts').doc(postId).collection('comments').add({
            name,
            text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Reset
        document.getElementById('comment-text').value = '';
        btn.disabled = false;
        btn.innerText = 'Post Comment';

        // Reload comments
        loadComments();

    } catch (error) {
        console.error(error);
        alert('Error posting comment');
        btn.disabled = false;
    }
}
