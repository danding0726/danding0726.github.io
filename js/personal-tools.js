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

  if (!todoForm || !thoughtForm) return;

  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const load = (key) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  };

  const save = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (_) {}
  };

  let todos = load(TODO_KEY);
  let thoughts = load(THOUGHT_KEY);
  let todoFilter = 'all';

  function formatTime(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
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
    todoStats.textContent = `${active} 项待办`;
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
              <span>${formatTime(item.createdAt)}</span>
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

  renderTodos();
  renderThoughts();
})();
