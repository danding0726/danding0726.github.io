---
layout: post
title: "模型量化：从基础概念到工程落地"
date: 2026-03-02 09:30:00 +0800
tags: [AI, 大模型, 工程实践]
---

<div class="blog-only" markdown="1">

模型量化的核心目标，是在尽量保留效果的前提下，用更低的显存和更高的推理效率支撑模型部署。

## 1. 量化基础

量化就是把浮点表示映射到低比特离散表示。常见对象有：

- 权重（weight）
- 激活值（activation）
- 梯度（gradient）

通常权重更稳定，激活值更容易出现异常值（outlier）。

### 图1：浮点表示背景

<img src="/images/posts/2026-03-02-llm-quantization/image1.png" alt="浮点表示背景图" style="width:78%; margin: 12px auto;" />

## 2. QAT 与 PTQ

- **QAT**：训练中模拟量化并反向修正，精度更稳但成本更高。  
- **PTQ**：训练后量化，接入快，适合先落地。

PTQ 常见两类：

- 动态量化：不依赖校准集，转换快；
- 校准量化：用代表性数据做参数校准，精度更稳。

## 3. 对称 vs 非对称量化

- 对称：实现简单；
- 非对称：区间利用率更高，但计算更复杂。

当激活值明显偏正（如 ReLU 后），非对称量化通常更合适。

### 图2：映射区间对比

<img src="/images/posts/2026-03-02-llm-quantization/image2.png" alt="对称与非对称量化对比图" style="width:78%; margin: 12px auto;" />

### 图3：非对称量化代价示意

<img src="/images/posts/2026-03-02-llm-quantization/image3.png" alt="非对称量化计算代价示意" style="width:78%; margin: 12px auto;" />

## 4. 粒度策略

- Per-Tensor：最简单，精度上限较低；
- Per-Channel：工程常用，精度与复杂度平衡；
- Per-Token：常用于动态激活量化。

此外，block-wise 量化能有效缓解异常值放大误差。

### 图4：block-wise 量化

<img src="/images/posts/2026-03-02-llm-quantization/image4.png" alt="block-wise 量化示意图" style="width:76%; margin: 12px auto;" />

## 5. 常见方案

### QLoRA

低比特权重量化 + LoRA 微调，结合 NF4 与 Double Quant，兼顾显存和效果。

### 图5：NF4 / QLoRA

<img src="/images/posts/2026-03-02-llm-quantization/image5.png" alt="QLoRA 与 NF4 示意图" style="width:76%; margin: 12px auto;" />

### GPTQ

逐参数量化并误差补偿，依赖校准数据，部署精度通常较稳。

### AWQ

识别关键权重通道并保守处理，在低比特下减少性能损失。

### GGUF

常用于本地推理生态的模型格式与分发兼容。

### 图6：GGUF 相关图示

<img src="/images/posts/2026-03-02-llm-quantization/image6.png" alt="GGUF 相关图示" style="width:72%; margin: 12px auto;" />

## 6. AIMET

AIMET 通过量化模拟插桩、样本校准和导出编码配置，帮助模型在目标硬件上提前验证量化效果。

### 图7：AIMET 流程

<img src="/images/posts/2026-03-02-llm-quantization/image7.png" alt="AIMET 量化流程图" style="width:76%; margin: 12px auto;" />

## 7. 总结

量化不是单点技巧，而是一套部署能力：

1. 先用 PTQ 找可用区间；
2. 再按误差热点优化粒度与方案；
3. 指标要同时看精度、时延、吞吐与成本。

</div>

<div class="deep-only" markdown="1">

模型量化的工程价值，不在于“把模型变小”，而在于把推理系统从“能跑”推进到“可持续运行”：在给定显存、成本和 SLA 下，维持稳定吞吐与可接受精度。

## 1. 问题定义：量化到底在优化什么

量化本质上是在做有损表示压缩：

- 把连续浮点空间映射为离散码本；
- 通过 `scale / zero-point` 还原近似值；
- 用更小存储与更低带宽换取推理效率。

真实线上目标通常是四维联合优化：

- 精度（任务成功率）
- 时延（TTFT / p95）
- 吞吐（tokens/s）
- 成本（GPU 小时与显存占用）

### 图1：浮点表示背景

这张图帮助理解量化误差来源：指数与尾数截断并非等价损失，不同分布下误差传播路径不同。

<img src="/images/posts/2026-03-02-llm-quantization/image1.png" alt="浮点表示背景图" style="width:78%; margin: 12px auto;" />

## 2. 路线选择：QAT 与 PTQ 的工程边界

### QAT

适合对精度极敏感、可接受再训练成本的场景。优点是可在训练阶段吸收量化噪声；缺点是周期长、资源重。

### PTQ

适合大多数线上首发版本。优势是快，通常几小时内可形成可部署结果。

PTQ 内部建议分两段：

1. 动态量化快速摸底（确认比特可行区间）；
2. 校准量化精修（确认边界样本下的稳定性）。

## 3. 对称 / 非对称量化：不是“哪个好”，而是“哪个更匹配分布”

当分布接近零中心、双侧对称时，对称量化实现简洁且性能稳定；当分布偏正（常见于激活），非对称量化更能利用区间。

### 图2：映射区间对比

这张图体现的是区间利用效率差异。

<img src="/images/posts/2026-03-02-llm-quantization/image2.png" alt="对称与非对称量化对比图" style="width:78%; margin: 12px auto;" />

### 图3：计算代价差异

非对称量化通常增加额外偏移相关计算，收益与代价要在吞吐测试里验证。

<img src="/images/posts/2026-03-02-llm-quantization/image3.png" alt="非对称量化计算代价示意" style="width:78%; margin: 12px auto;" />

## 4. 粒度策略：精度稳定性的关键杠杆

- Per-Tensor：低成本但粗糙；
- Per-Channel：权重量化常用最优点；
- Per-Token：动态激活下更精细。

在长上下文推理中，block-wise 往往比“盲目降比特”更能稳住质量。

### 图4：block-wise 量化

<img src="/images/posts/2026-03-02-llm-quantization/image4.png" alt="block-wise 量化示意图" style="width:76%; margin: 12px auto;" />

## 5. 方案定位：QLoRA / GPTQ / AWQ

### QLoRA

优势在于低显存微调可落地，NF4 + Double Quant 让“可训练性”和“可部署性”同时成立。

### 图5：NF4 / QLoRA

图中码本密度分布直接对应量化误差分配策略。

<img src="/images/posts/2026-03-02-llm-quantization/image5.png" alt="QLoRA 与 NF4 示意图" style="width:76%; margin: 12px auto;" />

### GPTQ

适合离线部署链路：通过逐参数量化与补偿，优先保障部署后精度。

### AWQ

核心思想是“保护关键通道”。在低比特条件下，这通常比全局均匀处理更有效。

### GGUF 与生态

GGUF 在本地推理生态中承担分发与兼容角色。

### 图6：GGUF 图示

<img src="/images/posts/2026-03-02-llm-quantization/image6.png" alt="GGUF 相关图示" style="width:72%; margin: 12px auto;" />

## 6. AIMET：把量化前移到可验证阶段

AIMET 的价值在于“先模拟，再部署”：

- 图插桩模拟量化行为；
- 校准样本搜索参数；
- 导出编码配置用于推理端复现。

### 图7：AIMET 流程

<img src="/images/posts/2026-03-02-llm-quantization/image7.png" alt="AIMET 量化流程图" style="width:76%; margin: 12px auto;" />

## 7. 一套可复用的实验模板

建议固定以下实验矩阵：

- 比特：FP16 / INT8 / INT4
- 粒度：Tensor / Channel / Block
- 指标：TTFT、tokens/s、显存峰值、任务准确率

每轮实验至少保留同一批回归样本，避免“评测漂移”导致误判。

## 8. 结论

量化真正的产出不是“参数变小”，而是更可控的推理系统。只要把路线选择、粒度策略与评测体系统一起来，量化就能变成稳定的工程能力，而不是一次性的调参技巧。

</div>
