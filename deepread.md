---
layout: page
title: 个人研读
permalink: /deepread/
sitemap: false
---

这里是个人研读入口（技术细节增强版内容会优先维护在这里）。

> 当前先建立入口，后续会逐步把每篇文章补充为“博客版 + 技术深读版”双层结构。

## 已收录

{% assign p1 = site.posts | where: "title", "模型量化：从基础概念到工程落地" | first %}
{% if p1 %}- [{{ p1.title }}]({{ site.baseurl }}{{ p1.url }}){% endif %}

{% assign p2 = site.posts | where: "title", "vLLM 大模型部署实战：从入门到生产" | first %}
{% if p2 %}- [{{ p2.title }}]({{ site.baseurl }}{{ p2.url }}){% endif %}
