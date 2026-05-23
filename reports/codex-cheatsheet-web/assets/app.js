(() => {
  'use strict';

  // ===== State =====
  let currentSection = 'getting-started';
  const searchInput = document.getElementById('searchInput');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  // ===== Navigation =====
  function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    const nav = document.querySelector(`.nav-item[data-target="${id}"]`);
    if (nav) nav.classList.add('active');
    currentSection = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeSidebar();
  }

  document.querySelectorAll('.nav-item[data-target]').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.target));
  });

  // ===== Mobile Sidebar =====
  function openSidebar() { sidebar.classList.add('open'); overlay.classList.add('open'); }
  function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('open'); }
  document.getElementById('menuBtn').addEventListener('click', openSidebar);
  overlay.addEventListener('click', closeSidebar);

  // ===== Card Expand/Collapse =====
  document.addEventListener('click', e => {
    const header = e.target.closest('.card-header');
    if (!header) return;
    const card = header.closest('.card');
    if (!card) return;
    card.classList.toggle('expanded');
  });

  // ===== Copy Template =====
  document.addEventListener('click', e => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    const pre = btn.closest('.template-block').querySelector('pre');
    if (!pre) return;
    const text = pre.textContent;
    navigator.clipboard.writeText(text).then(() => {
      btn.classList.add('copied');
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> 已复制`;
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> 复制`;
      }, 2000);
    });
  });

  // ===== Search =====
  let searchDebounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(doSearch, 200);
  });

  function doSearch() {
    const q = searchInput.value.trim().toLowerCase();
    const allSections = document.querySelectorAll('.section');

    // Clear previous highlights
    document.querySelectorAll('mark').forEach(m => {
      const parent = m.parentNode;
      parent.insertBefore(document.createTextNode(m.textContent), m);
      parent.removeChild(m);
      parent.normalize();
    });

    if (!q) {
      allSections.forEach(s => {
        s.style.display = '';
        s.querySelectorAll('.card').forEach(c => c.style.display = '');
      });
      showSection(currentSection);
      return;
    }

    // Show all sections for search
    allSections.forEach(s => s.classList.add('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    let totalMatches = 0;
    allSections.forEach(section => {
      const cards = section.querySelectorAll('.card');
      let sectionHasMatch = false;
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const hasMatch = text.includes(q);
        card.style.display = hasMatch ? '' : 'none';
        if (hasMatch) {
          sectionHasMatch = true;
          totalMatches++;
          // Expand matched cards
          card.classList.add('expanded');
          // Highlight text
          highlightInElement(card, q);
        }
      });
      // Check section title/desc
      const title = section.querySelector('.section-title');
      const desc = section.querySelector('.section-desc');
      const headerText = (title?.textContent + ' ' + desc?.textContent).toLowerCase();
      if (headerText.includes(q)) sectionHasMatch = true;
      section.style.display = sectionHasMatch ? '' : 'none';
    });

    // Show no-results message
    let noResults = document.getElementById('noResults');
    if (totalMatches === 0) {
      if (!noResults) {
        noResults = document.createElement('div');
        noResults.id = 'noResults';
        noResults.className = 'no-results';
        noResults.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><div>没有找到包含 "<strong>${escapeHtml(q)}</strong>" 的内容</div><div class="text-sm mt-2">试试搜索：安装、权限、模板、上下文、Browser</div>`;
        document.querySelector('.content').prepend(noResults);
      }
      noResults.style.display = 'block';
    } else if (noResults) {
      noResults.style.display = 'none';
    }
  }

  function highlightInElement(el, q) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(node => {
      if (node.parentElement.closest('pre, code, .template-block')) return;
      const text = node.textContent;
      const idx = text.toLowerCase().indexOf(q);
      if (idx === -1) return;
      const span = document.createElement('span');
      span.appendChild(document.createTextNode(text.slice(0, idx)));
      const mark = document.createElement('mark');
      mark.textContent = text.slice(idx, idx + q.length);
      span.appendChild(mark);
      span.appendChild(document.createTextNode(text.slice(idx + q.length)));
      node.parentNode.replaceChild(span, node);
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]));
  }

  // ===== Keyboard Shortcuts =====
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape') {
      closeSidebar();
      if (searchInput.value) {
        searchInput.value = '';
        doSearch();
      }
    }
  });

  // ===== Hash routing =====
  if (location.hash) {
    const id = location.hash.slice(1);
    if (document.getElementById(id)) showSection(id);
  }

  // ===== IntersectionObserver for nav highlight on scroll (when all sections visible) =====
  const observer = new IntersectionObserver(entries => {
    if (searchInput.value.trim()) return; // Don't interfere during search
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const nav = document.querySelector(`.nav-item[data-target="${id}"]`);
        if (nav) nav.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  document.querySelectorAll('.section').forEach(s => observer.observe(s));

})();
