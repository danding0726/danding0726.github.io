---
layout: post
title: "大模型量化入门到实践：QAT/PTQ、QLoRA、GPTQ、AWQ 一文讲清"
date: 2026-03-02 09:30:00 +0800
tags: [AI, 大模型, 量化]
---

> 这篇文章把“模型量化”从概念、方法到落地路径做一次结构化整理，适合做团队内部笔记，也适合直接对外分享。

## 1. 为什么量化是大模型落地的必修课

一句话：**量化是在尽量保留效果的前提下，把浮点计算改造成更省显存、更快推理的低比特计算**。

在真实工程里，量化最核心的价值有三个：

- **省显存**：同样硬件能跑更大模型，或同模型能跑更大 batch。
- **提速度**：低比特算子通常有更好的吞吐与时延。
- **降成本**：推理资源单价下降，线上部署更可控。

常见量化对象：

- **Weight（权重）**：分布相对稳定，最常优先量化。
- **Activation（激活）**：动态变化大，且容易有异常值（outlier）。
- **Gradient（梯度）**：更多见于训练环节优化场景。

<img src="/images/posts/2026-03-02-llm-quantization/image1.png" alt="浮点表示与量化背景" style="width:78%; margin: 12px auto;" />

---

## 2. 两条主路线：QAT 与 PTQ

## QAT（Quantization-Aware Training，量化感知训练）

先在训练/微调阶段“模拟量化”，再通过反向传播把精度拉回来。

**优点**
- 精度通常更稳，掉点更小。

**代价**
- 训练成本更高，工程链路更复杂。

适合：对精度敏感、且可接受再训练成本的场景。

## PTQ（Post-Training Quantization，后训练量化）

在已训练模型上直接做量化，通常无需完整再训练。

主要分两类：

1. **动态量化（Post Dynamic Quantization）**
   - 不依赖校准集或依赖极少。
   - 工程上接入快，适合快速验证。
   - QLoRA 常归到这一思路体系下理解。

2. **校准量化（Post Calibration Quantization）**
   - 需要代表性数据做 calibration。
   - 通常精度-性能权衡更可控。
   - GPTQ 是典型代表。

---

## 3. 量化公式视角：对称 vs 非对称

## 对称量化

- 零点通常固定在 0，形式简单。
- 算法和硬件实现较直接。

## 非对称量化

- 允许 zero-point 偏移，动态范围利用率更高。
- 对于激活值最小值大于 0（如 ReLU 后）时更友好。

**实战判断**：
- 若分布明显偏正、且想尽量吃满有效区间，优先考虑非对称量化。
- 若追求实现简单/算子路径成熟，对称量化仍是高频选择。

<img src="/images/posts/2026-03-02-llm-quantization/image2.png" alt="对称与非对称量化" style="width:78%; margin: 12px auto;" />

<img src="/images/posts/2026-03-02-llm-quantization/image3.png" alt="非对称量化计算代价" style="width:78%; margin: 12px auto;" />

---

## 4. 量化粒度：Per-Tensor、Per-Channel、Per-Token

量化精度和复杂度，很大程度由“粒度”决定。

1. **Per-Tensor**：整个张量一组 scale/zero-point（最粗，最省事）。
2. **Per-Channel**：每个通道独立量化（权重量化中很常见，精度更稳）。
3. **Per-Token**：每个 token 或时间步独立量化（激活动态量化常见）。

此外，工程中常把张量再切成 **block** 做量化（每个 block 独立 scale/zero-point），以降低 outlier 影响。

<img src="/images/posts/2026-03-02-llm-quantization/image4.png" alt="block-wise 量化示意" style="width:76%; margin: 12px auto;" />

---

## 5. 几个高频方案怎么理解

## QLoRA

核心思路：

- 对权重做低比特量化（常见 4bit）+ LoRA 微调。
- 使用 **NF4（NormalFloat4）** 等更贴合权重分布的量化类型。
- 使用 **Double Quantization** 继续压缩量化参数（如 scale）带来的额外显存开销。

<img src="/images/posts/2026-03-02-llm-quantization/image5.png" alt="NF4 与 QLoRA 示意" style="width:76%; margin: 12px auto;" />

适合：资源受限条件下，做高性价比微调。

## GPTQ

核心思路：

- 按 block 逐步量化参数，并在过程中补偿未量化参数误差。
- 依赖校准数据集，追求较好的精度保持。

适合：离线量化后部署推理，重视“可用精度”的场景。

## AWQ（Activation-aware Weight Quantization）

核心思路：

- 并非所有权重同等重要。
- 根据激活分布识别“关键通道/显著权重”，对其更保守处理。

适合：希望在低比特下尽量守住效果上限。

## GGUF

- 更偏模型发布/部署生态格式层面的关键角色。
- 在本地推理生态（如 CPU/GPU 混合部署）里非常常见。

---

## 6. 实践落地建议（可直接复用）

给一个团队可执行的最小路径：

### 第一步：先定目标，不要先定算法

先明确业务指标：
- 最大可接受精度下降（如 ≤1%）
- 时延目标（P95）
- 显存预算
- 吞吐目标

### 第二步：从 PTQ 开始做 baseline

建议顺序：
1. 先做 Per-Channel 权重量化（风险低、收益稳）
2. 再尝试激活量化（必要时引入 calibration）
3. 最后再评估是否要上 QAT 微调修正

### 第三步：优先处理 outlier 问题

- 先做 block-wise 量化
- 观察激活分布与层级误差热点
- 对关键层做更保守策略（例如保留更高比特）

### 第四步：评估体系要分层

至少要有两套评估：

- **离线能力评测**：任务准确率、困惑度、MMLU/专项集等
- **线上业务评测**：时延、吞吐、成本、稳定性

只看一套指标，容易出现“实验室好看，线上翻车”。

---

## 7. 一个常见误区

误区：**“比特越低越好。”**

现实：低比特收益确实高，但误差也会非线性放大。真正的工程最优解通常不是“全局最低比特”，而是：

- 在关键层保守一点
- 在冗余层激进一点
- 用分层策略换整体最优

---

## 8. 总结

如果你只记三件事：

1. **先用 PTQ 快速找到可用区间，再决定是否上 QAT。**
2. **量化成败不只在算法，更多在粒度与校准策略。**
3. **上线效果最终取决于业务指标，而不是论文指标。**

量化不是“压缩技巧”，而是大模型工程化能力的一部分。把它做成体系，模型部署的成本和稳定性会有明显跃升。

## 补充图示

<img src="/images/posts/2026-03-02-llm-quantization/image6.png" alt="补充图示1" style="width:72%; margin: 12px auto;" />

<img src="/images/posts/2026-03-02-llm-quantization/image7.png" alt="补充图示2" style="width:72%; margin: 12px auto;" />

---
