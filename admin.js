// Admin Logic

const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const editorView = document.getElementById('editor-view');
const postList = document.getElementById('admin-post-list');

// Check for File Protocol
if (window.location.protocol === 'file:') {
    const warning = document.getElementById('protocol-warning');
    if (warning) warning.style.display = 'block';

    // Disable all login interactions
    const forms = document.querySelectorAll('form input, form button, .social-btn');
    forms.forEach(el => {
        el.disabled = true;
        el.style.opacity = '0.5';
        el.style.cursor = 'not-allowed';
    });

    console.warn("Firebase Auth disabled: Running on file:// protocol.");
}

// Listen for Auth State
auth.onAuthStateChanged(user => {
    if (user) {
        loginView.style.display = 'none';
        dashboardView.style.display = 'block';
        loadAdminPosts();
    } else {
        loginView.style.display = 'block';
        dashboardView.style.display = 'none';
    }
});

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    const errorMsg = document.getElementById('login-error');

    // Reset Error
    errorMsg.textContent = '';

    // Simple Username Check (Mocked for existing user)
    // In a real app, you would query a 'users' collection where username == input
    let email = emailInput;
    if (!email.includes('@')) {
        // Assume username 'admin' maps to 'mohametjoseph10@gmail.com' for demo purposes
        // Or if you want to support any username, you need a backend mapping.
        if (emailInput.toLowerCase() === 'admin' || emailInput.toLowerCase() === 'mohamet') {
            email = 'mohametjoseph10@gmail.com';
        } else {
            errorMsg.textContent = '❌ Invalid email format or unknown username.';
            return;
        }
    }

    try {
        // Set Persistence
        const persistence = rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
        await auth.setPersistence(persistence);

        // Sign In
        await auth.signInWithEmailAndPassword(email, password);
        // Auth listener handles view switch
    } catch (error) {
        handleLoginError(error, errorMsg);
    }
});

// Show/Hide Password
document.getElementById('toggle-password').addEventListener('click', function () {
    const passwordInput = document.getElementById('admin-password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

// Forgot Password
document.getElementById('forgot-password-link').addEventListener('click', async () => {
    const emailInput = document.getElementById('admin-email').value;
    const errorMsg = document.getElementById('login-error');

    if (!emailInput || !emailInput.includes('@')) {
        errorMsg.textContent = '⚠️ Please enter your email address in the field above to reset password.';
        return;
    }

    if (confirm(`Send password reset email to ${emailInput}?`)) {
        try {
            await auth.sendPasswordResetEmail(emailInput);
            alert('Password reset email sent! Check your inbox.');
        } catch (error) {
            handleLoginError(error, errorMsg);
        }
    }
});

// Social Login
document.getElementById('google-login').addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
    } catch (error) {
        handleLoginError(error, document.getElementById('login-error'));
    }
});

document.getElementById('github-login').addEventListener('click', async () => {
    const provider = new firebase.auth.GithubAuthProvider();
    try {
        await auth.signInWithPopup(provider);
    } catch (error) {
        handleLoginError(error, document.getElementById('login-error'));
    }
});

// Error Handling Helper
function handleLoginError(error, errorElement) {
    console.error(error);
    switch (error.code) {
        case 'auth/invalid-email':
            errorElement.textContent = '❌ Invalid email address.';
            break;
        case 'auth/user-disabled':
            errorElement.textContent = '❌ This account has been disabled.';
            break;
        case 'auth/user-not-found':
            errorElement.textContent = '❌ Account not found.';
            break;
        case 'auth/wrong-password':
            errorElement.textContent = '❌ Incorrect password.';
            break;
        case 'auth/too-many-requests':
            errorElement.textContent = '❌ Too many failed attempts. Please try again later.';
            break;
        case 'auth/popup-closed-by-user':
            errorElement.textContent = '⚠️ Login cancelled.';
            break;
        case 'auth/operation-not-supported-in-this-environment':
            errorElement.textContent = '⚠️ Browser Error: See the warning above.';
            document.getElementById('protocol-warning').style.display = 'block';
            break;
        case 'auth/configuration-not-found':
            errorElement.textContent = '⚠️ Error: Sign-in provider not enabled in Firebase Console.';
            break;
        case 'auth/invalid-login-credentials':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            errorElement.textContent = '❌ Invalid email or password. Did you create the user in Firebase Console?';
            break;
        default:
            errorElement.textContent = '❌ Login failed: ' + error.message;
    }
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    auth.signOut();
});

// Create Post
document.getElementById('create-post-btn').addEventListener('click', () => {
    clearEditor();
    editorView.style.display = 'flex';
    editorView.scrollIntoView({ behavior: 'smooth' });
});

// Cancel Edit
document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    editorView.style.display = 'none';
});

// Save Post
document.getElementById('save-post-btn').addEventListener('click', async () => {
    const id = document.getElementById('post-id').value;
    const title = document.getElementById('post-title').value;
    const excerpt = document.getElementById('post-excerpt').value;
    const category = document.getElementById('post-category').value;
    const content = document.getElementById('post-content').value;
    const imageInput = document.getElementById('post-image');

    if (!title || !content) {
        alert("Title and Content are required");
        return;
    }

    const btn = document.getElementById('save-post-btn');
    btn.disabled = true;
    btn.innerText = "Saving...";

    try {
        let imageUrl = null;
        if (imageInput.files[0]) {
            // Upload Image
            const file = imageInput.files[0];
            const storageRef = storage.ref(`blog_images/${Date.now()}_${file.name}`);
            await storageRef.put(file);
            imageUrl = await storageRef.getDownloadURL();
        } else {
            // Keep existing image if editing
            if (id) {
                const oldDoc = await db.collection('posts').doc(id).get();
                imageUrl = oldDoc.data().imageUrl;
            }
        }

        const postData = {
            title,
            excerpt,
            category,
            content,
            imageUrl: imageUrl || null,
            publishedAt: firebase.firestore.FieldValue.serverTimestamp(), // Update time on save
            readTime: Math.ceil(content.split(' ').length / 200) + ' min' // Simple calc
        };

        if (id) {
            await db.collection('posts').doc(id).update(postData);
        } else {
            await db.collection('posts').add(postData);
        }

        editorView.style.display = 'none';
        loadAdminPosts();
        clearEditor();

    } catch (error) {
        console.error(error);
        alert("Error saving: " + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "Save & Publish";
    }
});


async function loadAdminPosts() {
    postList.innerHTML = '<p>Loading...</p>';
    const snapshot = await db.collection('posts').orderBy('publishedAt', 'desc').get();

    postList.innerHTML = '';

    snapshot.forEach(doc => {
        const post = doc.data();
        const div = document.createElement('div');
        div.className = 'blog-card';
        div.innerHTML = `
             <div class="blog-content">
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <div class="blog-footer">
                    <button onclick="editPost('${doc.id}')" class="btn secondary" style="font-size: 0.8rem; padding: 0.4rem 1rem;">Edit</button>
                    <button onclick="deletePost('${doc.id}')" class="btn secondary" style="border-color: red; color: red; font-size: 0.8rem; padding: 0.4rem 1rem;">Delete</button>
                </div>
             </div>
        `;
        postList.appendChild(div);
    });
}

// Global functions for inline onclick handlers (simpler for this context)
window.editPost = async (id) => {
    const doc = await db.collection('posts').doc(id).get();
    if (!doc.exists) return;
    const p = doc.data();

    document.getElementById('post-id').value = id;
    document.getElementById('post-title').value = p.title;
    document.getElementById('post-excerpt').value = p.excerpt;
    document.getElementById('post-category').value = p.category;
    document.getElementById('post-content').value = p.content;

    if (p.imageUrl) {
        document.getElementById('image-preview').innerHTML = `<img src="${p.imageUrl}" style="width: 100%;">`;
    } else {
        document.getElementById('image-preview').innerHTML = '';
    }

    editorView.style.display = 'flex';
    editorView.scrollIntoView();
};

window.deletePost = async (id) => {
    if (confirm("Are you sure you want to delete this post?")) {
        await db.collection('posts').doc(id).delete();
        loadAdminPosts();
    }
};

function clearEditor() {
    document.getElementById('post-id').value = '';
    document.getElementById('post-title').value = '';
    document.getElementById('post-excerpt').value = '';
    document.getElementById('post-content').value = '';
    document.getElementById('post-image').value = '';
    document.getElementById('image-preview').innerHTML = '';
}
