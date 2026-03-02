(function () {
  const TODO_KEY = 'jarvis_tools_todos_v1';
  const THOUGHT_KEY = 'jarvis_tools_thoughts_v1';

  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoDate = document.getElementById('todo-date');
  const todoList = document.getElementById('todo-list');
  const todoStats = document.getElementById('todo-stats');
  const todoFilterButtons = Array.from(document.querySelectorAll('.todo-filters button'));

  const thoughtForm = document.getElementById('thought-form');
  const thoughtInput = document.getElementById('thought-input');
  const thoughtTags = document.getElementById('thought-tags');
  const thoughtSearch = document.getElementById('thought-search');
  const thoughtList = document.getElementById('thought-list');
  const thoughtStats = document.getElementById('thought-stats');
  const clearDoneBtn = document.getElementById('clear-done-btn');
  const nlForm = document.getElementById('nl-form');
  const nlInput = document.getElementById('nl-input');

  if (!todoForm || !thoughtForm) return;

  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const isMobile = () => window.innerWidth <= 768;

  const load = (key) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  };

  let save = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (_) {}
  };

  let todos = load(TODO_KEY);
  let thoughts = load(THOUGHT_KEY);
  let todoFilter = 'all';

  // Clear completed
  if (clearDoneBtn) {
    clearDoneBtn.addEventListener('click', () => {
      if (confirm('确定清除所有已完成项？')) {
        todos = todos.filter(x => !x.done);
        renderTodos();
      }
    });
  }

  // Mobile: Enter to submit
  if (isMobile()) {
    todoInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') todoForm.dispatchEvent(new Event('submit'));
    });
    thoughtInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') thoughtForm.dispatchEvent(new Event('submit'));
    });
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function formatRelativeTime(ts) {
    const now = Date.now();
    const diff = now - ts;
    const sec = Math.floor(diff / 1000);
    const min = Math.floor(sec / 60);
    const hour = Math.floor(min / 60);
    const day = Math.floor(hour / 24);

    if (sec < 60) return '刚刚';
    if (min < 60) return `${min}分钟前`;
    if (hour < 24) return `${hour}小时前`;
    if (day < 7) return `${day}天前`;
    return formatTime(ts);
  }

  function parseNaturalInput(raw) {
    const text = (raw || '').trim();
    if (!text) return null;

    // More flexible matching
    const isThought = /^(想法|灵感|记录|idea|thought)[:：,\s]/i.test(text);
    const isDone = /^(完成|done|已完成)[:：,\s]/i.test(text);
    
    // Extract tags
    const tagMatch = text.match(/标签\s*[:：]?\s*(.+)$/i);
    const tags = tagMatch
      ? tagMatch[1].split(/[，,\s]+/).map(s => s.trim()).filter(Boolean).slice(0, 8)
      : [];

    // Extract date
    let dueDate = '';
    const now = new Date();
    if (/明天/.test(text)) {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      dueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } else if (/今天/.test(text)) {
      dueDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    } else {
      const m = text.match(/(\d{4}-\d{1,2}-\d{1,2})/);
      if (m) dueDate = m[1];
    }

    let content = text
      .replace(/^(想法|灵感|记录|idea|thought)[:：,\s]*/i, '')
      .replace(/^(完成|done|已完成)[:：,\s]*/i, '')
      .replace(/标签\s*[:：]?.+$/i, '')
      .replace(/提醒我|待办|todo|TODO|需要做|记得/g, '')
      .replace(/[，,。；;]+/g, ' ')
      .trim();

    if (isDone) {
      return { type: 'todo', content, done: true, dueDate };
    }

    if (isThought) {
      return { type: 'thought', content, tags };
    }

    // Default: create todo (not thought) for ambiguous inputs
    return { type: 'todo', content, done: false, dueDate };
  }

  // Export/Import
  function exportData() {
    const data = { todos, thoughts, exportedAt: Date.now() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal-tools-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.todos) todos = data.todos;
        if (data.thoughts) thoughts = data.thoughts;
        save(TODO_KEY, todos);
        save(THOUGHT_KEY, thoughts);
        renderTodos();
        renderThoughts();
        alert('导入成功！');
      } catch (_) {
        alert('导入失败，文件格式错误');
      }
    };
    reader.readAsText(file);
  }

  // Add export/import to thoughts tool
  const thoughtTool = document.getElementById('thought-tool');
  if (thoughtTool) {
    const actionDiv = document.createElement('div');
    actionDiv.className = 'tool-actions';
    actionDiv.innerHTML = `
      <button id="export-btn">导出数据</button>
      <input type="file" id="import-file" accept=".json" style="display:none" />
      <button id="import-btn">导入数据</button>
    `;
    thoughtTool.appendChild(actionDiv);
    
    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-file').click());
    document.getElementById('import-file').addEventListener('change', (e) => {
      if (e.target.files[0]) importData(e.target.files[0]);
    });
  }

  function renderTodos() {
    const filtered = todos.filter((item) => {
      if (todoFilter === 'active') return !item.done;
      if (todoFilter === 'done') return item.done;
      return true;
    });

    todoList.innerHTML = '';
    if (!filtered.length) {
      todoList.innerHTML = '<li class="empty">当前筛选下暂无任务</li>';
    } else {
      filtered
        .sort((a, b) => Number(a.done) - Number(b.done) || b.createdAt - a.createdAt)
        .forEach((item) => {
          const li = document.createElement('li');
          li.className = `item-row ${item.done ? 'is-done' : ''}`;
          li.innerHTML = `
            <label class="item-main">
              <input type="checkbox" ${item.done ? 'checked' : ''} data-action="toggle" data-id="${item.id}" />
              <span class="item-text">${item.text}</span>
            </label>
            <div class="item-side">
              ${item.dueDate ? `<span class="item-date">⏰ ${item.dueDate}</span>` : ''}
              <button data-action="edit" data-id="${item.id}">编辑</button>
              <button data-action="delete" data-id="${item.id}" class="danger">删除</button>
            </div>
          `;
          todoList.appendChild(li);
        });
    }

    const active = todos.filter((x) => !x.done).length;
    const done = todos.filter((x) => x.done).length;
    todoStats.textContent = `${active} 项待办`;
    
    // Update filter button badges
    todoFilterButtons.forEach(btn => {
      const filter = btn.getAttribute('data-filter');
      let count = 0;
      if (filter === 'all') count = todos.length;
      else if (filter === 'active') count = active;
      else if (filter === 'done') count = done;
      
      // Remove old badge
      const oldBadge = btn.querySelector('.badge');
      if (oldBadge) oldBadge.remove();
      
      // Add new badge if count > 0
      if (count > 0) {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = count;
        btn.appendChild(badge);
      }
    });
    
    save(TODO_KEY, todos);
  }

  function renderThoughts() {
    const q = (thoughtSearch.value || '').trim().toLowerCase();
    const filtered = thoughts
      .filter((item) => {
        if (!q) return true;
        return item.text.toLowerCase().includes(q) || item.tags.join(',').toLowerCase().includes(q);
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    thoughtList.innerHTML = '';
    if (!filtered.length) {
      thoughtList.innerHTML = '<li class="empty">暂无匹配记录</li>';
    } else {
      filtered.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'item-row thought-row';
        li.innerHTML = `
          <div class="item-main thought-main">
            <p class="item-text">${item.text}</p>
            <div class="thought-meta">
              <span>${formatRelativeTime(item.createdAt)}</span>
              ${item.tags.length ? `<span class="tags">#${item.tags.join(' #')}</span>` : ''}
            </div>
          </div>
          <div class="item-side">
            <button data-action="delete-thought" data-id="${item.id}" class="danger">删除</button>
          </div>
        `;
        thoughtList.appendChild(li);
      });
    }

    thoughtStats.textContent = `${thoughts.length} 条记录`;
    save(THOUGHT_KEY, thoughts);
  }

  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;

    todos.push({
      id: uid(),
      text,
      dueDate: todoDate.value || '',
      done: false,
      createdAt: Date.now(),
    });

    todoInput.value = '';
    todoDate.value = '';
    renderTodos();
  });

  todoList.addEventListener('click', (e) => {
    const target = e.target;
    const id = target.getAttribute('data-id');
    const action = target.getAttribute('data-action');
    if (!id || !action) return;

    if (action === 'delete') {
      todos = todos.filter((x) => x.id !== id);
    }

    if (action === 'edit') {
      const current = todos.find((x) => x.id === id);
      if (!current) return;
      const updated = window.prompt('编辑任务内容', current.text);
      if (updated === null) return;
      const v = updated.trim();
      if (!v) return;
      current.text = v;
    }

    renderTodos();
  });

  todoList.addEventListener('change', (e) => {
    const target = e.target;
    const id = target.getAttribute('data-id');
    const action = target.getAttribute('data-action');
    if (action !== 'toggle' || !id) return;

    const item = todos.find((x) => x.id === id);
    if (!item) return;
    item.done = Boolean(target.checked);
    renderTodos();
  });

  todoFilterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      todoFilterButtons.forEach((x) => x.classList.remove('active'));
      btn.classList.add('active');
      todoFilter = btn.getAttribute('data-filter');
      renderTodos();
    });
  });

  // Visual feedback helper
  function flashItem(li, type = 'add') {
    li.style.transition = 'all 0.3s ease';
    li.style.transform = type === 'add' ? 'translateY(-10px)' : 'translateX(20px)';
    li.style.opacity = '0';
    setTimeout(() => li.remove(), 300);
  }

  thoughtForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = thoughtInput.value.trim();
    if (!text) return;

    const tags = thoughtTags.value
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 8);

    thoughts.push({
      id: uid(),
      text,
      tags,
      createdAt: Date.now(),
    });

    thoughtInput.value = '';
    thoughtTags.value = '';
    renderThoughts();
  });

  thoughtList.addEventListener('click', (e) => {
    const target = e.target;
    const id = target.getAttribute('data-id');
    const action = target.getAttribute('data-action');
    if (action !== 'delete-thought' || !id) return;

    thoughts = thoughts.filter((x) => x.id !== id);
    renderThoughts();
  });

  thoughtSearch.addEventListener('input', renderThoughts);

  if (nlForm && nlInput) {
    nlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = nlInput.value;
      const parsed = parseNaturalInput(raw);
      
      console.log('NL Input:', raw, '-> Parsed:', parsed);
      
      if (!parsed || !parsed.content) {
        alert('无法识别输入，请尝试：提醒我 xxx / 想法：xxx');
        return;
      }

      if (parsed.type === 'todo') {
        todos.push({
          id: uid(),
          text: parsed.content,
          dueDate: parsed.dueDate || '',
          done: Boolean(parsed.done),
          createdAt: Date.now(),
        });
        renderTodos();
      } else {
        thoughts.push({
          id: uid(),
          text: parsed.content,
          tags: parsed.tags || [],
          createdAt: Date.now(),
        });
        renderThoughts();
      }

      nlInput.value = '';
    });
  }

  // Escape to clear search
  thoughtSearch.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      thoughtSearch.value = '';
      renderThoughts();
    }
  });

  // Auto-save indicator
  const showSaveIndicator = (msg, container) => {
    const indicator = document.createElement('span');
    indicator.className = 'save-indicator';
    indicator.textContent = msg;
    indicator.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#22c55e;color:#fff;padding:8px 12px;border-radius:8px;font-size:12px;z-index:9999;animation:fadeIn 0.2s';
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 1500);
  };

  const originalSave = save;
  save = (key, data) => {
    originalSave(key, data);
    const isTodo = key === TODO_KEY;
    const indicator = document.querySelector('.save-indicator');
    if (!indicator) {
      setTimeout(() => showSaveIndicator(isTodo ? '✓ Todo已保存' : '✓ 想法已保存'), 100);
    }
  };

  // Initial render
  renderTodos();
  renderThoughts();
})();
