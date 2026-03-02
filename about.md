---
layout: page
title: About
permalink: /about/
---

<div class="about-intro">
  人工智能与数据分析方向硕士，长期聚焦计算机视觉、多模态学习与端侧部署。关注从算法研究到工程落地的完整链路，主要方向包括目标检测、语义分割、推荐系统与轻量化模型优化。
</div>

<style>
  .timeline-wrap {
    margin-top: 1.8rem;
    color: #3d3d3d;
  }

  .timeline-title {
    margin: 2rem 0 0.8rem;
    font-size: 1.08rem;
    font-weight: 600;
    color: #2f2f2f;
  }

  .timeline {
    position: relative;
    margin: 0;
    padding: 0.4rem 0 0.2rem;
  }

  .timeline::before {
    content: "";
    position: absolute;
    left: 8.4rem;
    top: 0;
    bottom: 0;
    width: 1px;
    background: #e4e7eb;
  }

  .timeline-item {
    list-style: none;
    position: relative;
    display: grid;
    grid-template-columns: 7.4rem 1fr;
    gap: 1rem;
    margin: 0;
    padding: 0.15rem 0 1.25rem;
  }

  .timeline-time {
    text-align: right;
    font-size: 0.92rem;
    line-height: 1.5;
    color: #8a8f98;
    white-space: nowrap;
    padding-top: 0.1rem;
  }

  .timeline-content {
    position: relative;
    padding: 0 0 0.1rem 0.9rem;
  }

  .timeline-content::before {
    content: "";
    position: absolute;
    left: -0.42rem;
    top: 0.48rem;
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
    border: 2px solid #7aa2ff;
    background: #fff;
    box-sizing: border-box;
  }

  .timeline-role {
    margin: 0;
    font-size: 0.98rem;
    line-height: 1.55;
    color: #2f2f2f;
    font-weight: 500;
  }

  .timeline-desc {
    margin: 0.2rem 0 0;
    font-size: 0.93rem;
    line-height: 1.65;
    color: #5f6670;
  }

  @media (max-width: 760px) {
    .timeline::before {
      left: 0.35rem;
    }

    .timeline-item {
      grid-template-columns: 1fr;
      gap: 0.35rem;
      padding: 0.15rem 0 1rem;
    }

    .timeline-time {
      text-align: left;
      padding-left: 1rem;
      font-size: 0.88rem;
    }

    .timeline-content {
      padding-left: 1rem;
    }

    .timeline-content::before {
      left: 0.08rem;
      top: 0.44rem;
    }
  }
</style>

<div class="timeline-wrap">
  <h3 class="timeline-title">教育背景</h3>
  <ul class="timeline">
    <li class="timeline-item">
      <div class="timeline-time">2022.09 - 2025.11</div>
      <div class="timeline-content">
        <p class="timeline-role">法国院校 · 硕士 · 人工智能与数据分析</p>
      </div>
    </li>
    <li class="timeline-item">
      <div class="timeline-time">2019.09 - 2022.09</div>
      <div class="timeline-content">
        <p class="timeline-role">上海某211院校 · 本科 · 信息工程</p>
      </div>
    </li>
  </ul>

  <h3 class="timeline-title">实习经历</h3>
  <ul class="timeline">
    <li class="timeline-item">
      <div class="timeline-time">2025.06 - 至今</div>
      <div class="timeline-content">
        <p class="timeline-role">某研究实验室 · 端侧大模型部署</p>
        <p class="timeline-desc">多模态能力集成、LoRA 微调、量化部署与推理优化。</p>
      </div>
    </li>
    <li class="timeline-item">
      <div class="timeline-time">2024.08 - 2025.02</div>
      <div class="timeline-content">
        <p class="timeline-role">法国某公司 · 停车监控系统</p>
        <p class="timeline-desc">目标检测、边缘侧部署、模型结构与性能优化。</p>
      </div>
    </li>
    <li class="timeline-item">
      <div class="timeline-time">2023.02 - 2023.07</div>
      <div class="timeline-content">
        <p class="timeline-role">法国某公司 · 工业缺陷检测</p>
        <p class="timeline-desc">语义分割建模，基于 UNet 与 CBAM 的缺陷识别优化。</p>
      </div>
    </li>
  </ul>

  <h3 class="timeline-title">项目经验</h3>
  <ul class="timeline">
    <li class="timeline-item">
      <div class="timeline-time">2025.01 - 2025.03</div>
      <div class="timeline-content">
        <p class="timeline-role">推荐系统项目</p>
        <p class="timeline-desc">召回、排序、特征工程与离线评估流程建设。</p>
      </div>
    </li>
  </ul>
</div>
