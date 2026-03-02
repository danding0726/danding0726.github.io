---
layout: default
title: Personal Tools
permalink: /tools/
---

<section class="hero-card tools-hero">
  <h1>个人工具台</h1>
  <p>你的 Todo 清单与灵感速记，默认仅本地存储在当前浏览器。</p>
</section>

<section class="tools-grid">
  <article class="tool-card" id="todo-tool">
    <div class="tool-header">
      <h2>Todo List</h2>
      <span class="tool-meta" id="todo-stats">0 项待办</span>
    </div>

    <form id="todo-form" class="tool-form">
      <input id="todo-input" type="text" placeholder="输入待办事项，例如：整理本周文章草稿" required />
      <input id="todo-date" type="date" aria-label="截止日期" />
      <button type="submit">添加</button>
    </form>

    <div class="todo-filters" role="group" aria-label="Todo筛选">
      <button data-filter="all" class="active">全部</button>
      <button data-filter="active">进行中</button>
      <button data-filter="done">已完成</button>
    </div>

    <ul id="todo-list" class="item-list"></ul>
  </article>

  <article class="tool-card" id="thought-tool">
    <div class="tool-header">
      <h2>瞬间想法</h2>
      <span class="tool-meta" id="thought-stats">0 条记录</span>
    </div>

    <form id="thought-form" class="tool-form">
      <input id="thought-input" type="text" placeholder="记录这一刻的想法..." required />
      <input id="thought-tags" type="text" placeholder="标签（可选，逗号分隔）" />
      <button type="submit">记录</button>
    </form>

    <input id="thought-search" type="search" class="search-inline" placeholder="搜索想法/标签" />

    <ul id="thought-list" class="item-list"></ul>
  </article>
</section>

<script src="{{ site.baseurl }}/js/personal-tools.js"></script>
