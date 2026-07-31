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

    if (links) {
        const page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
        links.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href').split('#')[0];
            if (href === page || (page === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
});
