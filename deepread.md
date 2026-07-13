---
layout: page
title: 技术研读
permalink: /deepread/
sitemap: false
hide_title: true
---

<section class="hero-card">
  <p class="hero-kicker">DEEP READING / TECHNICAL GUIDES</p>
  <h1>技术研读</h1>
  <p>这里收录结构更完整、信息密度更高的技术长文，适合按章节深入阅读。</p>
</section>

> 更新说明：部分文章仍在补充。后续会逐步形成“技术速记 + 深度长文”的双层内容结构。

## 已收录文章 / FEATURED POSTS

{% assign p1 = site.posts | where: "title", "模型量化：从基础概念到工程落地" | first %}
{% if p1 %}- [{{ p1.title }}]({{ site.baseurl }}{{ p1.url }}){% endif %}

{% assign p2 = site.posts | where: "title", "vLLM 大模型部署实战：从入门到生产" | first %}
{% if p2 %}- [{{ p2.title }}]({{ site.baseurl }}{{ p2.url }}){% endif %}
