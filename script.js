const PROJECTS = [
    {
        name: 'Novaris PVP Bot',
        short: 'Advanced Minecraft PVP bot with autonomous progression and swarm coordination.',
        tags: ['Minecraft', 'PVP', 'Automation'],
        description: 'An advanced Minecraft bot specialized in PVP combat, autonomous progression from wood to netherite, base defense, and multi-bot swarm coordination.',
        versions: [
            { label: 'v3.5.0', meta: 'Latest', file: 'assets/downloads/pvpbot-v3.5.0.zip' },
            { label: 'v3.0.0', meta: '', file: 'assets/downloads/pvpbot-v3.0.0.zip' },
            { label: 'v2.0.0', meta: '', file: 'assets/downloads/pvpbot-v2.0.0.zip' }
        ]
    }
];

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

    initProjects();
    initModal();
});

function initProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    const search = document.getElementById('search');
    const tagsFilter = document.getElementById('tags-filter');
    const empty = document.getElementById('empty-state');

    const allTags = [...new Set(PROJECTS.flatMap(p => p.tags))].sort();
    let activeTag = '';

    tagsFilter.innerHTML = allTags.map(tag =>
        `<button class="tag-btn" data-tag="${tag}">${tag}</button>`
    ).join('');

    tagsFilter.addEventListener('click', e => {
        const btn = e.target.closest('.tag-btn');
        if (!btn) return;
        activeTag = btn.dataset.tag === activeTag ? '' : btn.dataset.tag;
        tagsFilter.querySelectorAll('.tag-btn').forEach(b =>
            b.classList.toggle('active', b.dataset.tag === activeTag)
        );
        render();
    });

    search.addEventListener('input', render);

    function render() {
        const q = search.value.trim().toLowerCase();
        const filtered = PROJECTS.filter(p => {
            const matchesTag = !activeTag || p.tags.includes(activeTag);
            const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.short.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
            return matchesTag && matchesSearch;
        });

        empty.hidden = filtered.length > 0;

        grid.querySelectorAll('.project-card').forEach(el => el.remove());

        filtered.forEach(p => {
            const card = document.createElement('article');
            card.className = 'project-card';
            card.innerHTML = `
                <h3 class="project-title">${p.name}</h3>
                <p class="project-desc">${p.short}</p>
                <div class="project-tags">
                    ${p.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
                </div>
                <button class="btn btn-primary btn-sm download-btn" data-project="${p.name}">Download</button>
            `;
            grid.appendChild(card);
        });

        grid.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const project = PROJECTS.find(p => p.name === btn.dataset.project);
                if (project) openModal(project);
            });
        });
    }

    render();
}

function initModal() {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;

    const closeBtn = document.getElementById('modal-close');

    function close() {
        overlay.hidden = true;
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', close);

    overlay.addEventListener('click', e => {
        if (e.target === overlay) close();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !overlay.hidden) close();
    });

    window.openModal = openModal;
}

function openModal(project) {
    const overlay = document.getElementById('modal-overlay');
    document.getElementById('modal-title').textContent = project.name;
    document.getElementById('modal-desc').textContent = project.description;

    const versionsEl = document.getElementById('modal-versions');
    versionsEl.innerHTML = project.versions.map(v => `
        <div class="version-item">
            <div>
                <div class="version-label">${v.label}</div>
                ${v.meta ? `<div class="version-meta">${v.meta}</div>` : ''}
            </div>
            <a href="${v.file}" class="btn btn-primary btn-sm version-download" download>Download</a>
        </div>
    `).join('');

    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
}
