# Mohamet Joseph Portfolio

A full-stack developer portfolio website featuring interactive "antigravity" physics animations, dark mode, and Firebase integration.

## Getting Started

Since this project is built with Vanilla HTML/CSS/JS (to ensure compatibility without a complex Node.js setup), you can run it directly.

1.  **Open the Project**: Navigate to the `d:/Myweb` folder.
2.  **Launch**: Double-click `index.html` to open it in your web browser.

## Features

*   **Antigravity Hero Section**: Interactive falling/floating shapes using Matter.js. You can drag and throw the elements!
*   **Dark Mode**: Toggle between Light and Dark themes (persists in your browser).
*   **Responsive**: Fully functional on Mobile, Tablet, and Desktop.
*   **Firebase Contact Form**: Connects to Firestore to save messages.

## Firebase Setup (Required for Contact Form)

To make the contact form work, you need to create a free Firebase project:

1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project.
3.  Navigate to **Project Settings** (gear icon) > **General** > **Your apps** > **Web app** (</> icon).
4.  Register the app and copy the `firebaseConfig` object (apiKey, authDomain, etc.).
5.  Open `js/app.js` in a code editor.
6.  Replace the placeholder `firebaseConfig` at the top of the file with your actual config.
7.  **Firestore Database**:
    *   Go to **Firestore Database** in the left menu.
    *   Click **Create Database** (start in **Test Mode** for verified testing).
    *   Create a collection named `contacts` (the code does this automatically if permissions allow, but make sure your Rules allow writing).
    *   **Rules Example** (for testing):
        ```
        allow write: if true;
        ```
        *(Note: Secure your rules before production).*

## Customization

*   **Projects**: Edit the HTML in the `#portfolio` section of `index.html`.
*   **Physics**: Tweak gravity or shapes in the `initAntigravity()` function in `js/app.js`.
