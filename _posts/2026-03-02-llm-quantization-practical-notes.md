---
layout: post
title: "模型量化：从基础概念到工程落地（全覆盖整理版）"
date: 2026-03-02 09:30:00 +0800
tags: [AI, 大模型, 工程实践]
---

## 1. 量化的基本定义

模型量化可以理解为：把浮点数表示转换成低比特（定点/离散）表示，同时尽可能减少精度损失。

常见量化对象包括：

- 参数（weight）
- 激活值（activation）
- 梯度（gradient）

其中，**weight 分布通常更稳定**，而 **activation 更容易出现异常值（outlier）**。

### 图1：浮点表示背景

下图用于说明浮点表示与后续量化映射问题的背景。

<img src="/images/posts/2026-03-02-llm-quantization/image1.png" alt="浮点表示背景图" style="width:78%; margin: 12px auto;" />

---

## 2. QAT 与 PTQ

按流程可分为：

## 2.1 QAT（Quant-Aware Training）

也叫在线量化。核心是：

- 在训练阶段引入量化模拟
- 用反向传播调整权重
- 目标是减少量化后的精度掉点

## 2.2 PTQ（Post-Training Quantization）

也叫离线量化。核心是：

- 在已训练模型上直接做量化
- 使用少量或不使用额外数据完成校准

进一步可分为：

- **Post Dynamic Quantization**：不依赖校准集，按层直接转换（原文将 QLoRA 归于该类）。
- **Post Calibration Quantization**：需要代表性校准集，按层输入输出调整量化参数（原文将 GPTQ 归于该类）。

---

## 3. 对称量化 vs 非对称量化

按映射规则可分为：

- 对称量化
- 非对称量化

核心区别在于是否保持“0点映射规则”与 zero-point 偏移策略。

### 图2：对称/非对称映射示意

该图用于对比两类量化的映射区间与零点策略。

<img src="/images/posts/2026-03-02-llm-quantization/image2.png" alt="对称与非对称量化对比图" style="width:78%; margin: 12px auto;" />

实践中需要注意：

- 当激活值最小值 > 0（如 ReLU 后）时，对称区间会浪费负区间动态范围。
- 这类场景通常更适合使用非对称量化（zero-point 移到区间起点）。

### 图3：非对称量化的额外计算代价

该图对应原文中“非对称量化计算代价更高”的公式说明。

<img src="/images/posts/2026-03-02-llm-quantization/image3.png" alt="非对称量化计算代价示意" style="width:78%; margin: 12px auto;" />

---

## 4. 量化粒度策略

原文给出三种常见粒度：

## 4.1 Per-Tensor 量化

- 整个 tensor 使用同一组 `scale/zero-point`
- 粒度最粗，工程实现最简单

例：`[B, C, H, W]` 整体共用一组参数。

## 4.2 Per-Channel 量化

- 按通道独立量化（常见于权重）
- 精度通常优于 Per-Tensor

例：卷积权重 `[out_c, in_c, kH, kW]`，每个 `out_c` 用独立参数。

## 4.3 Per-Token 量化

- 按 token 或时间步独立量化
- 常见于动态激活量化

例：Transformer 输入 `[batch, seq_len, hidden_dim]`，对每个 `seq_len` 位置独立估计参数。

另外，原文强调了 **block-wise 量化**：

- 把输入 tensor 切成 block
- 每个 block 独立 scale/zero-point
- 可降低 outlier 对整体精度的影响

### 图4：block-wise 量化示意

该图对应“按块量化降低异常值影响”的核心逻辑。

<img src="/images/posts/2026-03-02-llm-quantization/image4.png" alt="block-wise 量化示意图" style="width:76%; margin: 12px auto;" />

---

## 5. QLoRA

要点如下：

- QLoRA 针对 weight 量化
- 采用对称量化
- 使用 NF（NormalFloat）类型（如 NF4）来更好拟合正态分布权重
- NF4 格点分位分配在中间更密、两端更疏，有助于在压缩与精度间平衡

### 图5：NF4 / QLoRA 示意

该图用于解释 NF4 的格点分配思想。

<img src="/images/posts/2026-03-02-llm-quantization/image5.png" alt="QLoRA 与 NF4 示意图" style="width:76%; margin: 12px auto;" />

进一步的优化是 **Double Quant**：

- 对量化后的 scale 再做一次量化
- 因 scale 常以 FP32 存储，block 多时会占用可观显存
- 将 scale 进一步压缩（原文示例为 FP8）可继续减小显存消耗

---

## 6. GPTQ

定义如下：

- 对 block 内参数逐个量化
- 每量化一个参数，会对该 block 内未量化参数做补偿调整
- 目标是减少累计误差造成的精度损失
- 需要准备校准数据集

---

## 7. AWQ（Activation-aware Weight Quantization）

要点如下：

- 权重对模型性能贡献并不均匀
- 大约有 0.1%~1% 的显著权重对效果影响很大
- 跳过这部分显著权重不量化，可显著减小误差

关键思想：

- 显著通道识别应基于激活分布，而非仅看权重分布
- 与更大激活幅度对应的权重通道通常更关键

---

## 8. GGUF

当前该章节为概要占位，后续可继续补充实践细节。

### 图6：GGUF相关配图（原文图示）

该图用于说明部署格式与生态工具链关系。

<img src="/images/posts/2026-03-02-llm-quantization/image6.png" alt="GGUF 相关图示" style="width:72%; margin: 12px auto;" />

---

## 9. AIMET 量化方法

原文展开的是“量化模拟（QuantizationSimModel）”路线：

- AIMET 在模型图中插入量化模拟节点，构建适配目标硬件的模拟模型
- 通过代表性样本（可来自训练集或校准集）搜索更优量化参数（scale/offset）
- 原文给出的经验值：约 1000 个样本通常可用于参数搜索
- 导出阶段可输出：
  - 去除模拟节点的 FP32 原始模型
  - 优化后量化编码（JSON）

### 图7：AIMET 量化模拟流程

该图对应 AIMET 的仿真与导出流程。

<img src="/images/posts/2026-03-02-llm-quantization/image7.png" alt="AIMET 量化流程图" style="width:76%; margin: 12px auto;" />

文末保留了 “Post-Training Quantization” 小节标题，具体细节可在后续版本补充。

---

## 10. 总结

这份材料的核心主线是：

1. 量化对象与误差来源（尤其 activation outlier）
2. QAT/PTQ 两大路径
3. 对称/非对称量化与计算代价取舍
4. 粒度策略（Per-Tensor / Per-Channel / Per-Token / block-wise）
5. QLoRA、GPTQ、AWQ 在实践中的定位
6. AIMET 的量化模拟与导出方法

如果后续你补全 GGUF 与 AIMET-PTQ 小节，我可以直接做“增量覆盖更新”，保持这篇文章结构不变。
