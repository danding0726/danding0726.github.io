---
layout: post
title: "【深度解读】2026-03-06｜AI Agent 基础设施爆发：从框架战争到生产就绪"
date: 2026-03-06 10:00:00 +0800
tags: [AI, 深度解读, AI Agents, Jido, PageAgent, 基础设施]
---

## 背景与问题定义

过去 72 小时内，AI Agent 基础设施领域迎来一波密集发布：Jido 2.0（Elixir Agent 框架）、PageAgent（阿里巴巴 GUI Agent）、NavAgent（浏览器自动化 MCP）、Vela（AI 调度创业公司）、Thewebsite.app（AI 运营的商业实验）——这些项目虽然来自不同技术栈、面向不同场景，但共同指向一个趋势：**AI Agent 正从概念验证阶段迈向量产阶段。**

这不是第一次出现"Agent 框架爆发"。2023 年 LangChain 出圈时，行业也曾经历类似热闹。但当时的焦点是"如何让 LLM 调用工具"——本质上是 API 封装层面的创新。2026 年这一波不同：焦点转移到了"如何在生产环境中可靠地运行 Agent"——这涉及编排、状态管理、错误恢复、多 Agent 协作等更深层的问题。

理解这波基础设施升级，是理解 AI 应用未来的关键。

---

## 核心项目深度解析

### Jido 2.0：BEAM 上的 Agent 框架

**是什么：** Jido 是用 Elixir 编写的 Agent 框架，3 月 5 日发布 2.0 版本。Elixir 运行在 BEAM（Erlang 虚拟机）上，以高并发、高容错著称。

**关键特性：**

- **多 Agent 编排**：支持跨分布式 BEAM 进程运行多个 Agent，适合需要大量并发 Agent 的场景
- **多种推理策略**：内置 ReAct（推理+行动）、CoT（思维链）、ToT（思维树）等推理模式
- **工具调用与 Agent 技能**：类似 LangChain 的 Tool Calling，但更强调"技能"（Skill）概念——Agent 可以加载特定领域的能力
- **MCP 集成**：支持 Model Context Protocol，可以连接外部服务（传感器、API、数据库）
- **持久化层**：内置存储和持久化能力，Agent 的状态可以在重启后恢复
- **可观测性**：深度集成 OpenTelemetry，支持全链路追踪和调试

**为什么重要：** BEAM 架构天然适合 Agent 场景。Agent 需要长时间运行、需要处理异步任务、需要容错——这些正是 Erlang/Elixir 的传统强项。Jido 2.0 的发布意味着：Agent 基础设施开始分化，不再是"一个框架统治一切"，而是"为不同场景选择不同架构"。

**适用场景：** 需要高并发、高可用性的企业级 Agent 系统，如客服 Agent 集群、自动化交易系统、实时协作平台。

### PageAgent：嵌入 Web 应用的 GUI Agent

**是什么：** PageAgent 是阿里巴巴开源的框架，可以将 AI Agent 直接嵌入 Web 应用。Agent 与应用运行在同一页面，可以直接操作 DOM，无需外部控制。

**关键特性：**

- **原生嵌入**：作为一个库引入网页，Agent 可以访问页面的完整状态
- **SPA 支持**：支持单页应用、Shadow DOM、跨域 iframe
- **紧凑的 DOM 扫描**：与传统的截图+视觉模型方案不同，PageAgent 只扫描可交互元素，生成结构化列表，大幅降低 token 消耗
- **可编辑内容支持**：处理 contenteditable 区域等复杂 DOM 结构

**为什么重要：** 大多数 AI Agent 框架假设 Agent 运行在独立环境中，通过 API 与外部世界交互。PageAgent 代表了一种"inside-out"思路——Agent 不再是外部工具，而是应用的一部分。

这打开了一个有趣的设计空间：如果 Agent 可以直接感知用户正在做的事情，它可以提供更及时、更上下文感知的帮助。

**适用场景：** 需要 Agent 与用户协同操作的 Web 应用，如在线文档协作、电商平台客服、SaaS 应用的智能助手。

### NavAgent：轻量级浏览器自动化

**是什么：** NavAgent 是一个 MCP（Model Context Protocol）服务器，配合 Chrome 扩展使用。它的核心能力是让 AI 客户端直接控制用户的浏览器会话。

**关键特性：**

- **无需 CDP**：不依赖 Chrome DevTools Protocol，而是通过扩展扫描 DOM，通过 WebSocket 与 AI 通信
- **本地运行**：所有数据保留在本地，不需要远程服务器
- **轻量级**：相比 Playwright 等方案，NavAgent 的通信开销极低

**为什么重要：** 这是第一个面向"日常浏览器任务"的 MCP 工具。之前的浏览器自动化方案主要面向测试和爬虫，NavAgent 的定位是"让 AI 帮你操作浏览器"——如自动填表、批量处理邮件、聚合信息。

**与 PageAgent 的关系：** 两者都处理浏览器场景，但互补。PageAgent 面向 Web 应用开发者，将 Agent 能力嵌入自己的产品；NavAgent 面向最终用户，让自己的浏览器变成 Agent 的工具。

**适用场景：** 个人效率提升、批量操作自动化、需要跨网站操作的工作流。

### Vela：复杂调度的 AI Agent

**是什么：** Vela 是 Y Combinator W26 批次的创业公司，专注于 AI 驱动的复杂日程调度。3 月 5 日在 Hacker News 发布后引发讨论。

**关键特性：**

- **多角色调度**：同时协调多方、多渠道（邮件、短信、WhatsApp、Slack）的日程安排
- **自然语言理解**：从非结构化对话中提取时间、地点、参与者信息
- **行为预测**：根据不同人群的回复模式（高管 vs 求职者 vs 卡车司机）调整交互策略
- **动态重排**：当原定日程变更时，自动重新协调所有相关方

**为什么重要：** 调度是一个看似简单、实则复杂的任务。Vela 的创始人指出核心挑战：参与者的行为模式差异巨大——CEO 几小时内回复邮件并期望正式的"三选一"提案；物流公司的卡车司机用共享设备在奇怪的时间回复"你明天下午都行"。

这种行为数据的积累，构成了 Vela 的护城河。

**适用场景：** 企业招聘面试调度、客户会议协调、多方协作项目管理。

### Thewebsite.app：AI 当 CEO 的商业实验

**是什么：** 一个实验性项目，AI Agent 以"CEO"身份运营一家商业公司。目标是：从 0 增长到 8 万美元月收入。

**为什么重要：** 这是第一个公开的、实时的"AI 运营商业"实验。之前的 AI CEO 概念要么是噱头，要么是内部概念验证。Thewebsite.app 的独特之处在于：

- AI 拥有真实的决策权（不是"建议权"，是"决定权"）
- 决策过程完全公开（每一步都记录在博客）
- 代码开源（GitHub 上可查看）
- 有明确的目标和时间线

AI 能否做出好的商业决策？能否平衡短期收入与长期愿景？这个实验将给出答案。

---

## 行业意义与趋势判断

### 基础设施分化的背后

这一波发布揭示了 AI Agent 领域的一个核心趋势：**分化**。

2023 年的 Agent 框架（如 LangChain、AutoGPT）试图做一个"通用"框架——什么场景都能用，但什么都不够深。

2026 年的框架选择了相反的策略：**专精**。Jido 专注高并发企业场景，PageAgent 专注 Web 应用，NavAgent 专注浏览器，Vela 专注调度。每个框架在其垂直场景下都比通用框架更强。

这种分化是健康的。说明市场已经度过了"概念验证"阶段，开始追求"生产就绪"。

### 编排层的崛起

这一波项目的另一个共同点是**编排能力**的强化。

LangChain 的核心是"链"（Chain）——将 LLM 与工具串起来。新的框架更强调"编排"（Orchestration）——不仅串起来，还要管理状态、处理错误、协调多 Agent。

这反映了实际需求：在生产环境中，Agent 不是"跑一次就完"的工具，而是需要长期运行、持续状态管理、优雅处理异常的服务。

### 多 Agent 协作的突破

Jido 2.0 的多 Agent 支持是值得注意的信号。

此前的 Agent 系统大多是"单 Agent + 工具"模式。现实世界的复杂任务往往需要多个 Agent 协作：比如一个处理用户请求，一个调用外部 API，一个审核输出。

多 Agent 协作引入了新的挑战：通信协议、状态同步、冲突解决、分布式追踪。这些正是 Jido 试图解决的问题。

---

## 趋势小结

1. **框架分化加速**：通用框架让位给专精框架，每个垂直场景将有最佳选择
2. **编排层成为焦点**：从"调用工具"进化到"管理状态、处理错误、协调多 Agent"
3. **BEAM 架构获得关注**：Jido 证明了 Erlang/Elixir 在 Agent 场景的天然优势
4. **浏览器成为 Agent 入口**：PageAgent 和 NavAgent 代表了"让 AI 操作你的浏览器"的新范式
5. **商业实验常态化**：Thewebsite.app 类型的实时实验将帮助行业理解 AI 的真正能力边界

---

## 参考来源

- Jido GitHub, "[Jido 2.0 Release](https://github.com/jido-dev/jido)", 2026年3月5日
- Alibaba, "[PageAgent Documentation](https://alibaba.github.io/page-agent/)", 2026年3月4日
- NavAgent GitHub, "[NavAgent MCP](https://github.com/DimitriBouriez/navagent-mcp)", 2026年3月5日
- Vela, "[YC W26 发布会](https://tryvela.ai)", 2026年3月5日
- Thewebsite.app, "[AI CEO 实验](https://www.thewebsite.app/)", 2026年3月6日
- Hacker News, "[多则相关讨论](https://news.ycombinator.com)", 2026年3月5日