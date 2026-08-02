const PROJECTS = [
    {
        name: 'Novaris PVP Bot',
        short: 'Advanced Minecraft PVP bot with autonomous progression and swarm coordination.',
        tags: ['Minecraft', 'PVP', 'Automation'],
        release: { owner: 'Yozakura001', repo: 'Novaris.github.io', tag: 'v2.0.0', asset: 'pvpbot-v2.0.0.zip' },
        description: 'An advanced Minecraft bot specialized in PVP combat, autonomous progression from wood to netherite, base defense, and multi-bot swarm coordination.',
        versions: [
            { label: 'v2.0.0', meta: 'Latest', file: 'https://github.com/Yozakura001/Novaris.github.io/releases/download/v2.0.0/pvpbot-v2.0.0.zip', available: true },
            { label: 'v1.0.0', meta: 'Not available', file: '', available: false }
        ]
    },
    {
        name: 'ARIA',
        short: 'Discontinued prototype of an autonomous voice agent (STT, LLM, TTS).',
        tags: ['AI', 'Voice', 'Prototype'],
        release: { owner: 'Yozakura001', repo: 'ARIA', tag: 'v0.1.0', asset: 'aria-source-v0.1.0.zip' },
        discontinued: true,
        description: 'A discontinued prototype of an autonomous voice agent: voice activity detection, speech-to-text, a local LLM, voice-timbre conversation focus, and Kokoro text-to-speech in Spanish. Source code available on GitHub.',
        versions: [
            { label: 'Source code', meta: 'Discontinued', file: 'https://github.com/Yozakura001/ARIA/releases/download/v0.1.0/aria-source-v0.1.0.zip', available: true }
        ]
    }
];

const COUNTS = {};

function countKey(release) {
    return `${release.owner}/${release.repo}/${release.tag}/${release.asset}`;
}

async function fetchCount(release, force) {
    const key = countKey(release);
    if (!force && COUNTS[key] !== undefined) return COUNTS[key];
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const r = await fetch(`https://api.github.com/repos/${release.owner}/${release.repo}/releases/tags/${release.tag}`, {
                headers: { 'Accept': 'application/vnd.github+json' },
                cache: 'no-store'
            });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const d = await r.json();
            const asset = (d.assets || []).find(a => a.name === release.asset);
            if (!asset) throw new Error('Asset no encontrado');
            const n = asset.download_count || 0;
            COUNTS[key] = n;
            return n;
        } catch (e) {
            if (attempt === 1) {
                return COUNTS[key] !== undefined ? COUNTS[key] : null;
            }
            await new Promise(r => setTimeout(r, 500));
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12 });
            revealEls.forEach(el => io.observe(el));
        } else {
            revealEls.forEach(el => el.classList.add('visible'));
        }
    }

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
    initTypewriter();
    initFaq();
});

function initProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    const search = document.getElementById('search');
    const tagsFilter = document.getElementById('tags-filter');
    const tagsBtn = document.getElementById('tags-btn');
    const tagsMenu = document.getElementById('tags-menu');
    const tagsOptions = document.getElementById('tags-options');
    const tagsCount = document.getElementById('tags-count');
    const empty = document.getElementById('empty-state');

    const allTags = [...new Set(PROJECTS.flatMap(p => p.tags))].sort();
    const activeTags = new Set();

    tagsOptions.innerHTML = allTags.map(tag =>
        `<button class="tag-option" data-tag="${tag}">
            <span>${tag}</span>
            <span class="tag-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
        </button>`
    ).join('');

    function updateTagsUI() {
        tagsOptions.querySelectorAll('.tag-option').forEach(opt =>
            opt.classList.toggle('active', activeTags.has(opt.dataset.tag))
        );
        const n = activeTags.size;
        tagsCount.hidden = n === 0;
        tagsCount.textContent = String(n);
        tagsBtn.classList.toggle('active', tagsMenu.classList.contains('open'));
    }

    function toggleMenu(force) {
        const isOpen = typeof force === 'boolean' ? force : !tagsMenu.classList.contains('open');
        tagsMenu.classList.toggle('open', isOpen);
        tagsMenu.hidden = !isOpen;
        tagsBtn.setAttribute('aria-expanded', String(isOpen));
        updateTagsUI();
    }

    tagsBtn.addEventListener('click', e => {
        e.stopPropagation();
        toggleMenu();
    });

    tagsOptions.addEventListener('click', e => {
        const opt = e.target.closest('.tag-option');
        if (!opt) return;
        const tag = opt.dataset.tag;
        if (activeTags.has(tag)) activeTags.delete(tag);
        else activeTags.add(tag);
        updateTagsUI();
        render();
    });

    document.addEventListener('click', e => {
        if (!tagsFilter.contains(e.target)) toggleMenu(false);
    });

    search.addEventListener('input', render);

    function render() {
        const q = search.value.trim().toLowerCase();
        const filtered = PROJECTS.filter(p => {
            const matchesTag = activeTags.size === 0 || [...activeTags].some(t => p.tags.includes(t));
            const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.short.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
            return matchesTag && matchesSearch;
        }).sort((a, b) => Number(!!a.discontinued) - Number(!!b.discontinued));

        empty.hidden = filtered.length > 0;

        grid.querySelectorAll('.project-card').forEach(el => el.remove());

        filtered.forEach(p => {
            const card = document.createElement('article');
            card.className = p.discontinued ? 'project-card project-discontinued' : 'project-card';
            card.setAttribute('data-project', p.name);
            const warn = p.discontinued
                ? '<span class="card-warning" title="Discontinued" aria-label="Discontinued">!</span>'
                : '';
            card.innerHTML = `
                ${warn}
                <h3 class="project-title">${p.name}</h3>
                <p class="project-desc">${p.short}</p>
                <div class="project-tags">
                    ${p.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
                </div>
                <div class="project-downloads-row">
                    <p class="project-downloads">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        <span class="downloads-count">—</span> downloads
                    </p>
                    <button class="btn btn-ghost btn-xs refresh-count" data-project="${p.name}" title="Actualizar contador" aria-label="Actualizar contador">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                    </button>
                </div>
                <button class="btn btn-primary btn-sm download-btn" data-project="${p.name}">Download</button>
            `;
            grid.appendChild(card);
            const countEl = card.querySelector('.downloads-count');
            fetchCount(p.release).then(n => {
                if (n !== null) {
                    countEl.textContent = n;
                } else {
                    countEl.textContent = '—';
                }
            });
        });

        grid.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const project = PROJECTS.find(p => p.name === btn.dataset.project);
                if (!project) return;
                openModal(project);
                setTimeout(() => {
                    fetchCount(project.release, true).then(n => {
                        if (n !== null) {
                            const el = document.querySelector(`.project-card[data-project="${project.name}"] .downloads-count`);
                            if (el) el.textContent = n;
                        }
                    });
                }, 15000);
            });
        });

        grid.querySelectorAll('.refresh-count').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const project = PROJECTS.find(p => p.name === btn.dataset.project);
                if (!project) return;
                const countEl = btn.closest('.project-card').querySelector('.downloads-count');
                if (!countEl) return;
                btn.classList.add('spinning');
                fetchCount(project.release, true).then(n => {
                    btn.classList.remove('spinning');
                    if (n !== null) {
                        countEl.textContent = n;
                    }
                });
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
    versionsEl.innerHTML = project.versions.map((v, i) => {
        const available = v.available !== false && v.file;
        const first = i === 0;
        return `
        <div class="version-item${available ? '' : ' version-disabled'}">
            <div class="version-info">
                <div class="version-label">${v.label}${v.meta ? ` <span class="version-badge${available ? '' : ' version-badge-muted'}">${v.meta}</span>` : ''}</div>
                <div class="version-meta">${available ? (first ? 'Recommended release' : 'Previous release') : 'This version is not available anymore'}</div>
            </div>
            ${available ? `
            <a href="${v.file}" class="btn btn-accent btn-sm version-download" download>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download
            </a>` : `
            <span class="btn btn-sm version-na" aria-disabled="true">Unavailable</span>`}
        </div>
    `;
    }).join('');

    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
}

function initFaq() {
    document.querySelectorAll('.faq-item').forEach(item => {
        const q = item.querySelector('.faq-q');
        const a = item.querySelector('.faq-a');
        if (!q || !a) return;
        q.addEventListener('click', () => {
            const isOpen = q.getAttribute('aria-expanded') === 'true';
            item.closest('.faq-list').querySelectorAll('.faq-item').forEach(other => {
                const oq = other.querySelector('.faq-q');
                const oa = other.querySelector('.faq-a');
                if (oq) oq.setAttribute('aria-expanded', 'false');
                if (oa) oa.style.maxHeight = '';
            });
            if (!isOpen) {
                q.setAttribute('aria-expanded', 'true');
                a.style.maxHeight = a.scrollHeight + 'px';
            }
        });
    });
}

function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;

    const phrases = [
        'Building the future...',
        'Always evolving...',
        'Creating intelligent systems...',
        'Where ideas become reality...'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
        const current = phrases[phraseIndex];

        if (!deleting) {
            charIndex++;
            el.textContent = current.slice(0, charIndex);
            if (charIndex === current.length) {
                deleting = true;
                setTimeout(tick, 2200);
                return;
            }
            setTimeout(tick, 95);
        } else {
            charIndex--;
            el.textContent = current.slice(0, charIndex);
            if (charIndex === 0) {
                deleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                setTimeout(tick, 500);
                return;
            }
            setTimeout(tick, 55);
        }
    }

    setTimeout(tick, 400);
}
