document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');

    if (toggle && links) {
        toggle.addEventListener('click', () => {
            const isOpen = links.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(isOpen));
            toggle.classList.toggle('active', isOpen);
        });

        links.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                links.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const header = document.querySelector('.site-header');
    if (header) {
        const active = () => {
            const navHeight = header.offsetHeight;
            let current = '';
            document.querySelectorAll('section[id]').forEach(section => {
                if (window.scrollY + navHeight + 40 >= section.offsetTop) {
                    current = section.id;
                }
            });
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
            });
        };
        window.addEventListener('scroll', active);
        active();
    }

    initNetworkSphere();
});

function initNetworkSphere() {
    const canvas = document.getElementById('sphere-canvas');
    if (!canvas) return;

    const container = canvas.parentElement;
    const ctx = canvas.getContext('2d');

    let width, height, dpr;
    let nodes = [];
    let raf;

    const RADIUS_RATIO = 0.42;
    const NODE_COUNT = 120;

    function resize() {
        dpr = window.devicePixelRatio || 1;
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        initNodes();
    }

    function initNodes() {
        const r = Math.min(width, height) * RADIUS_RATIO;
        const cx = width / 2;
        const cy = height / 2;
        nodes = [];

        for (let i = 0; i < NODE_COUNT; i++) {
            const theta = Math.acos(2 * Math.random() - 1);
            const phi = Math.random() * Math.PI * 2;
            nodes.push({
                x: cx + r * Math.sin(theta) * Math.cos(phi),
                y: cy + r * Math.sin(theta) * Math.sin(phi),
                z: r * Math.cos(theta)
            });
        }
    }

    function project(n) {
        const persp = 900 / (900 - n.z);
        return {
            x: width / 2 + (n.x - width / 2) * persp,
            y: height / 2 + (n.y - height / 2) * persp,
            s: persp
        };
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        const projected = nodes.map(project);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        for (let i = 0; i < projected.length; i++) {
            for (let j = i + 1; j < projected.length; j++) {
                const a = projected[i];
                const b = projected[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 80) {
                    ctx.globalAlpha = (1 - dist / 80) * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;

        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            const p = projected[i];
            const alpha = 0.2 + 0.8 * ((n.z + 200) / 400);
            ctx.globalAlpha = Math.max(0.15, Math.min(1, alpha));
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.6 * p.s, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        raf = requestAnimationFrame(draw);
    }

    resize();
    draw();

    window.addEventListener('resize', () => {
        cancelAnimationFrame(raf);
        resize();
        draw();
    });
}
