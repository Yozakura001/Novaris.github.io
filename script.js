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
});
