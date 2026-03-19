---
layout: post
title: "【AI 日报】2026-03-01｜TOP5 热点"
date: 2026-03-01 10:00:00 +0800
content_type: ai_daily
tags: [AI, 日报, 热点]
---

## 今日摘要

过去24小时的公开信号显示：

1. **开源端继续"工具化落地"**：GitHub Trending 上与 Agent 工程链路相关仓库（如 `claude-code`、`deer-flow`、`hermes-agent`）保持高热。
2. **社区端以"可用性/基础设施"讨论为主**：HN 新帖更偏向"Agent开发工具、持久化记忆、审批基础设施"。
3. **论文端热点转向"安全+评测+可控性"**：arXiv 多篇关注 prompt injection，防泄漏、决策审计、自我报告失当行为等。
4. **噪音上升**：Reddit 过去24h中高质量技术贴占比不高，营销/招聘类内容较多，需做源头筛选。

---

## 重点 TOP5

1. **GitHub: claude-code**（今日 +699 stars）  
   结论：AI 编码 Agent 的"终端原生工作流"仍是开发者主战场。

2. **GitHub: deer-flow**（今日 +899 stars）  
   结论：Agent workflow 编排/流水线类项目关注度高，企业级工程化需求明确。

3. **HN: agent-made Rust replacement for libxml2**（57 points）  
   结论：社区对"Agent 参与核心系统组件开发"的可行性与风险都高度关注。

4. **arXiv: AgentSentry（2602.22724）**  
   结论：Agent 安全防护正从"关键词拦截"走向"轨迹级因果定位+净化"。

5. **arXiv: Silent Egress（2602.22450）**  
   结论：仅靠输出审查不足，必须把网络出口控制纳入一线防护。

---

## 论文速览

- **EMPO²（2602.23008）**：记忆增强 + on/off-policy 混合优化，解决 RL Agent "会做熟题不会探路"痛点
- **OmniGAIA/OmniAtlas（2602.22897）**：全模态 Agent 基准，文本→多模态+多工具链升级
- **Training Agents to Self-Report Misbehavior（2602.22303）**：训练 Agent 主动上报违规行为
- **A Framework for Assessing AI Agent Decisions（2602.22442）**：评测从 outcome-only 转向 decision-centric

---

## 工程落地建议

1. **默认最小出网策略**：为 Agent 工具调用加域名 allowlist + redirect 审计
2. **过程日志做成五段式**：intent / tool_call / tool_result / decision / safety_gate
3. **上线前做 IPI 对抗测试**：检索结果污染、网页元数据注入、工具返回注入
4. **评测体系升级**：增加决策质量、回退能力、越权率、泄漏率
5. **多 Agent 场景加仲裁层**：防止目标漂移、资源争抢与"部落化"策略偏航

---
