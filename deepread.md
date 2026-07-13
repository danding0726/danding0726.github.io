---
layout: page
title: 密封研读舱
permalink: /deepread/
sitemap: false
hide_title: true
---

<section class="hero-card">
  <p class="hero-kicker">SEALED ANALYSIS CHAMBER / AUXILIARY POWER</p>
  <h1>外面的风暴还在继续。<br>这里适合完整解码。</h1>
  <p>只有完成初步恢复的高密度技术日志，才会被送入这间仍可供电的密封研读舱。</p>
</section>

> RECOVERY NOTICE：部分档案仍不完整。后续将逐步形成“现场速记 + 完整解码”双层记录。

## 已恢复记录 / RECOVERED FILES

{% assign p1 = site.posts | where: "title", "模型量化：从基础概念到工程落地" | first %}
{% if p1 %}- [{{ p1.title }}]({{ site.baseurl }}{{ p1.url }}){% endif %}

{% assign p2 = site.posts | where: "title", "vLLM 大模型部署实战：从入门到生产" | first %}
{% if p2 %}- [{{ p2.title }}]({{ site.baseurl }}{{ p2.url }}){% endif %}
