---
layout: post
title: "AIMET 量化踩坑实录：为什么 W16 比 W8 更容易触发 bias out of range？"
date: 2026-03-19 15:20:00 +0800
content_type: tech_notes
tags:
  - AIMET
  - 模型量化
  - QAIRT
  - Bias
  - 问题排查
description: "结合一次真实排障，解释 bias out of range 的成因、为什么 W16 反而更容易触发，以及如何用 adjust_bias_encoding 做工程折中。"
---

最近在基于 AIMET 做模型量化时，我遇到了一个比较典型的问题：`W16` 量化模型在转换阶段报错 `bias out of range`，而且最终量化损失明显高于 `W8` 模型。这个问题在量化流程里并不少见，但我第一次踩到这个坑，所以把整个分析过程梳理一下。

先简单回顾一下量化的基本概念。通常我们会用 `W / A / B` 来描述一个量化模型，也就是权重（Weight）、激活（Activation）和偏置（Bias）分别使用多少 bit。例如常见的 `w8a8b32`、`w8a16b32`、`w16a16b32`，表示权重、激活、偏置分别采用对应的量化位宽。

量化的本质，是把原本的浮点数映射到有限的整数范围内，用更少的存储和更高效的定点计算去近似原始浮点计算。最简化地看，一个浮点值通常可以表示为：

```text
real_value ≈ scale * (quant_value - zero_point)
```

有些框架也会写成 `scale * (quant_value + offset)`。本质上是一样的，都是用整数值配合 `scale` 和 `zero-point/offset` 去恢复原始实数。

其中，权重和激活一般都比较直观，真正容易踩坑的是 `bias`。因为实际计算并不是把三者各自量化完就结束了，而是在卷积或全连接中执行类似下面的运算：

```text
y = sum(x * w) + b
```

这里 `x` 是输入激活，`w` 是权重，`b` 是偏置。由于 `x` 和 `w` 在量化后会先参与整数乘法和累加，因此这个累加结果天然落在一个由 `input_scale * weight_scale` 决定的数值域里。为了能够直接和累加结果相加，`bias` 也必须被映射到同一个尺度上。也就是说，`bias` 的量化通常不能独立选择一个 `scale`，而是会满足下面这个关系：

```text
bias_int ≈ bias_fp / (input_scale * weight_scale)
```

这时就能看出所谓的 `bias range` 是从哪里来的。它不是一个“拍脑袋指定”的范围，而是由 `bias` 对应的 encoding 决定的；而这个 encoding 又和 `input_scale * weight_scale` 强相关。`input_scale` 通常对应上一层输出的 `act_scale`，`weight_scale` 则是当前层的权重 `scale`，因此 `bias range` 本质上与这两个量直接相关。

即使 `bias` 最终使用的是 `sFxp_32`，也不代表它一定绝对安全。真正的约束条件是：`bias_fp / (input_scale * weight_scale)` 得到的整数值，是否还能落进当前 encoding 能表示的范围内。如果这个整数值过大或过小，超过了对应位宽和 encoding 的上下限，就会报 `bias out of range`。

为什么会出现这种情况？最常见的原因就是 `input_scale * weight_scale` 太小。因为分母一旦很小，`bias_fp / (input_scale * weight_scale)` 的结果就会迅速变大，最终把 `bias` 的整数表示推到可表示范围之外。

这个问题在 `per-channel quantization` 下更常见，因为每个通道都有自己的 `weight_scale`，某些通道的 `scale` 可能特别小，最终导致只有个别 channel 的 `bias` 爆掉。除此之外，如果 `bias` 本身在 BN folding 之后变得很大，或者用户提供的 encoding 与当前图结构并不完全匹配，也会加剧这个问题。

从这个角度再看，为什么 `W16` 反而更容易出问题就比较好理解了。量化 `scale` 的直观公式可以粗略写成：

```text
scale ≈ max_abs / qmax
```

对于同样一组权重，`w16` 的整数可表示范围比 `w8` 大得多，所以 quantizer 往往会给出更小的 `weight_scale`。`weight_scale` 一旦变小，`input_scale * weight_scale` 就更容易变小，最终 `bias_fp / (input_scale * weight_scale)` 也更容易变得很大。

也就是说，`W16` 虽然理论上量化粒度更细，但它也更容易把 `bias` 推向一个更极端的整数域，从而触发 `bias out of range`。这也是为什么“位宽更高”并不一定意味着“更稳定”。至少在 `bias` 这个问题上，`W16` 反而可能比 `W8` 更容易踩坑。

针对这个问题，QAIRT 里有一个比较直接的选项叫 `adjust_bias_encoding`。它的作用不是简单地“把 bias 放宽一点”，而是调整 `bias encoding`，必要时也会连带调整权重 encoding，从而保证 `bias` 的实际值能够落进 `bias encoding` 的可表示范围。

换句话说，它本质上是在重新平衡 `weight_scale` 与 `bias` 可表示范围之间的关系，让 `bias` 不至于在量化时直接溢出。官方文档里也明确提到，这个选项的目的就是：修改 `bias encoding` 和 `weight encoding`，确保 `bias value` 落在 `bias encoding` 的可表示范围内。

不过它并不是没有代价。为了迁就 `bias range`，它可能会引入权重 clipping，进而影响最终精度。因此它更像是一个工程上的折中方案：当模型在转换阶段已经因为 `bias out of range` 无法通过时，先让模型能够落地，再去评估由此带来的精度损失是否可以接受。
