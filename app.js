// Firebase Configuration is now in js/firebase-config.js
// Ensure that script is loaded before this one.

// UI Interactions
document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Management (System Awareness)
    const themeBtn = document.getElementById('theme-btn');
    const themeMenu = document.getElementById('theme-menu');
    const themeOptions = themeMenu.querySelectorAll('li');
    const body = document.body;
    const icon = themeBtn.querySelector('i');

    function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        // Remove existing theme data
        body.removeAttribute('data-theme');

        // Determine effective theme
        let effectiveTheme = theme;
        if (theme === 'system') {
            effectiveTheme = getSystemTheme();
        }

        // Apply
        if (effectiveTheme === 'dark') {
            body.setAttribute('data-theme', 'dark');
            icon.className = 'fas fa-moon'; // Icon for button
        } else {
            icon.className = 'fas fa-sun';
        }

        // Update Active State in Menu
        themeOptions.forEach(opt => {
            if (opt.dataset.theme === theme) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });

        // Save preference
        localStorage.setItem('theme', theme);
    }

    // Initialize
    const savedTheme = localStorage.getItem('theme') || 'system';
    applyTheme(savedTheme);

    // Event Listeners for Buttons
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            applyTheme(theme);
        });
    });

    // Listen for System Changes (if in system mode)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('theme') === 'system') {
            const newSystemTheme = e.matches ? 'dark' : 'light';
            // Just re-apply system to trigger UI update if needed
            applyTheme('system');
        }
    });

    // Toggle Menu on Mobile (optional, since hover works on desktop)
    themeBtn.addEventListener('click', () => {
        // Simple toggle for mobile if hover doesn't work well
        const isVisible = getComputedStyle(themeMenu).visibility === 'visible';
        // In CSS we use hover, but for click we might need a class
    });

    // 2. Mobile Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        // Toggle icon between bars and times
        const i = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            i.classList.remove('fa-bars');
            i.classList.add('fa-times');
        } else {
            i.classList.remove('fa-times');
            i.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.querySelector('i').classList.remove('fa-times');
            hamburger.querySelector('i').classList.add('fa-bars');
        });
    });

    // 3. Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const btn = contactForm.querySelector('button');

            // UI Loading State
            formStatus.textContent = "Sending...";
            formStatus.style.color = "#333";
            btn.disabled = true;
            btn.innerText = "Sending...";

            try {
                // 1. Save to Firestore (Database) - Optional/Safe Check
                const name = formData.get('name');
                const email = formData.get('email');
                const message = formData.get('message');

                // Check if 'db' is defined (global) and valid
                if (typeof db !== 'undefined' && db) {
                    try {
                        await db.collection('contacts').add({
                            name,
                            email,
                            message,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    } catch (dbError) {
                        console.warn("Firestore save failed (non-fatal):", dbError);
                    }
                }

                // 2. Send Email via Web3Forms (Notification)
                // We use fetch to prevent redirect.
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.textContent = "Message sent successfully!";
                    formStatus.style.color = "green";
                    contactForm.reset();

                    setTimeout(() => {
                        formStatus.textContent = "";
                    }, 5000);
                } else {
                    // Try to parse error from Web3Forms
                    const data = await response.json();
                    console.error("Web3Forms Error:", data);
                    throw new Error("Email submission failed. " + (data.message || ""));
                }
            } catch (error) {
                console.error("Error:", error);
                formStatus.textContent = "Error sending message. Please try again.";
                formStatus.style.color = "red";
            } finally {
                btn.disabled = false;
                btn.innerText = "Send Message";
            }
        });
    }

    // 4. Antigravity Effect (Matter.js)
    initAntigravity();
});

function initAntigravity() {
    const container = document.getElementById('antigravity-scene');
    if (!container) return;

    // Module aliases
    const Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse;

    // Create engine
    const engine = Engine.create();

    // Set gravity to be low/floating
    engine.world.gravity.y = 0.5; // Standard gravity is 1, 0.5 is floaty

    // Create renderer
    const render = Render.create({
        element: container,
        engine: engine,
        options: {
            width: container.clientWidth,
            height: container.clientHeight,
            background: 'transparent',
            wireframes: false,
            pixelRatio: window.devicePixelRatio
        }
    });

    // Create bodies
    const wallOptions = { isStatic: true, render: { fillStyle: 'transparent' } };

    // Walls to keep items in view
    const floor = Bodies.rectangle(container.clientWidth / 2, container.clientHeight + 30, container.clientWidth, 60, wallOptions);
    const leftWall = Bodies.rectangle(-30, container.clientHeight / 2, 60, container.clientHeight, wallOptions);
    const rightWall = Bodies.rectangle(container.clientWidth + 30, container.clientHeight / 2, 60, container.clientHeight, wallOptions);

    // Floating shapes
    const shapes = [];
    const colors = ['#C15004', '#D8D3BF', '#333333']; // Theme colors

    for (let i = 0; i < 15; i++) {
        const x = Math.random() * container.clientWidth;
        const y = -Math.random() * 500; // Start above screen
        const size = Math.random() * 40 + 20; // Random size
        const color = colors[Math.floor(Math.random() * colors.length)];

        let body;
        const randomShape = Math.random();

        if (randomShape < 0.33) {
            // Circle
            body = Bodies.circle(x, y, size / 2, {
                restitution: 0.9, // Bouncy
                render: { fillStyle: color, strokeStyle: '#fff', lineWidth: 2 }
            });
        } else if (randomShape < 0.66) {
            // Square
            body = Bodies.rectangle(x, y, size, size, {
                restitution: 0.9,
                render: { fillStyle: color, strokeStyle: '#fff', lineWidth: 2 }
            });
        } else {
            // Polygon
            body = Bodies.polygon(x, y, 3 + Math.floor(Math.random() * 3), size / 2, {
                restitution: 0.9,
                render: { fillStyle: color, strokeStyle: '#fff', lineWidth: 2 }
            });
        }
        shapes.push(body);
    }

    Composite.add(engine.world, [floor, leftWall, rightWall, ...shapes]);

    // Mouse Interaction
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

    Composite.add(engine.world, mouseConstraint);

    // Keep the mouse in sync with rendering
    render.mouse = mouse;

    // Fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: container.clientWidth, y: container.clientHeight }
    });

    // Run the renderer
    Render.run(render);

    // Create runner
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Handle Resize
    window.addEventListener('resize', () => {
        render.canvas.width = container.clientWidth;
        render.canvas.height = container.clientHeight;

        Render.lookAt(render, {
            min: { x: 0, y: 0 },
            max: { x: container.clientWidth, y: container.clientHeight }
        });

        // Reposition walls
        Matter.Body.setPosition(floor, { x: container.clientWidth / 2, y: container.clientHeight + 30 });
        Matter.Body.setPosition(rightWall, { x: container.clientWidth + 30, y: container.clientHeight / 2 });
    });
}
