# 晓报 · 早报 — 2026-07-26

*早安！以下是今日要闻速览。*

## 今日要点

本期要闻围绕技术与社会层面的多重张力展开：欧盟依据《数字市场法》对谷歌处以罚款，法院驳回谷歌针对搜索结果抓取工具的诉讼，折射出数字平台监管与数据采集边界的持续博弈；另一方面，美国麻疹病例创新高，评论文章批评 AI 热潮侵蚀理性决策，提醒各方在技术狂热中需警惕反科学情绪与非理性跟风。唯一的技术细节话题则提醒开发者在处理 Excel 列编号时避免进制误判这一常见工程陷阱。

---

## AI 前沿

- **Excel column numbering**
- 📍 John D Cook · 7月25日 · [原文](https://www.johndcook.com/blog/2026/07/25/excel-column-numbering/)
- 概要：技术博客作者撰文解析 Excel 列标签的编号机制，指出其并非简单的 base-26 进制，而是 A-Z 映射 1-26 的混合编号系统。
- 影响：这一机制对开发者处理 Excel 导入导出、构建电子表格自动化工具和开源表格库至关重要，错误的进制假设会导致列索引在 Z→AA 边界处出现偏移，是常见但易被忽视的工程陷阱。

## 国际动态

- **EU Fines Google $1 Billion for DMA Competition Violations, Including Making Search Results More Useful**
- 📍 Daring Fireball · 7月26日 · [原文](https://digital-markets-act.ec.europa.eu/commission-fines-google-eur890-million-breaches-digital-markets-act-2026-07-23_en)
- 概要：欧盟依据《数字市场法》(DMA)对谷歌处以约8.9亿欧元罚款，指控其违反竞争规则，包括在搜索结果中通过增强自家服务展示以实现自我优待。
- 影响：DMA 监管首次正式处罚“自我优待”行为，谷歌可能被迫调整搜索结果展示逻辑。对依赖 Google 搜索流量与 SEO 的开发者及依赖 Google 服务的中小竞争者意味着欧盟市场不确定性增加，需关注后续合规改造影响。
- **Court Grants SerpApi’s Motion to Dismiss Google Lawsuit**
- 📍 Daring Fireball · 7月26日 · [原文](https://serpapi.com/blog/google-v-serpapi-the-court-granted-our-motion-to-dismiss/)
- 概要：美国法院裁定批准 SerpApi 提出的动议，驳回了谷歌针对这家搜索引擎结果抓取服务商提起的诉讼。
- 影响：该判决为搜索引擎结果抓取(SERP scraping)行业提供了重要司法先例，谷歌主张爬取搜索结果违反服务条款的立场未获支持，第三方数据采集工具的法律风险暂时下降，相关开发者与数据服务商迎来更有利的合规环境。
- **‘AI Mania Is Eviscerating Global Decision-Making’**
- 📍 Daring Fireball · 7月26日 · [原文](https://ludic.mataroa.blog/blog/ai-mania-is-eviscerating-global-decision-making/)
- 概要：评论文章指出，当前全球范围内的决策过程正被“AI 热潮”严重侵蚀，资本、政策与企业战略盲目追逐 AI，忽视理性判断与风险评估。
- 影响：文章警示 AI 投资泡沫与监管短视的风险。对技术决策者意味着需警惕非理性跟风，在企业 AI 投入与战略规划中坚持成本效益与可解释性评估，避免在“AI 标签”驱动下做出偏离业务本质的资源配置。
- **Measles Cases Hit New Record in U.S., as Stupid-Americans Reject Vaccines**
- 📍 Daring Fireball · 7月26日 · [原文](https://www.nytimes.com/2026/07/24/well/measles-record-united-states-numbers.html?unlocked_article_code=1.0VA.4jBf.vqAYN4Bwu807)
- 概要：美国麻疹病例数创下近年新高，公共卫生部门将疫情反弹归因于民众对疫苗的错误抵触与拒绝接种行为。
- 影响：疫情反弹凸显反科学情绪与公共卫生基础设施信任危机的影响。对技术行业的启示是：当错误信息经由社交平台与算法放大时，工程与产品团队需承担更高的内容真实性责任，数据传播机制设计成为公共健康议题的一部分。

## 中文 AI 社区

- **100%开源！吴恩达做了个个人桌面Agent**
- 📍 量子位 · 7月25日 · [原文](https://www.qbitai.com/2026/07/460892.html)
- 概要：吴恩达发布一款个人桌面 Agent 项目，主打完全开源、本地优先、保护用户隐私且不绑定特定大模型，可在本地完成自动化任务。
- 影响：对于开发者而言，该项目降低了构建本地 Agent 的门槛，同时模型无关的设计意味着团队可自由切换底层 LLM，便于在隐私敏感场景中部署；但本地运行也意味着用户需自行承担算力和维护成本。
- **美国具身也没成熟！PI：中国公司何必总当“中国版XX”｜RSS 2026**
- 📍 量子位 · 7月25日 · [原文](https://www.qbitai.com/2026/07/460542.html)
- 概要：在 RSS 2026 大会上，Physical Intelligence（PI）联合创始人指出美国具身智能技术尚不成熟，呼吁中国机器人公司摆脱“中国版 XX”的模仿路径，走向原创。
- 影响：这一表态为国内机器人创业者提供了战略参考：模仿海外标杆的红利正在减弱，技术领导力和差异化场景将成为下一阶段竞争关键；投资人可能重新评估纯对标型项目的估值逻辑。
- **半价干翻Fable 5？Opus 5实测炸场，网友：差点从椅子上摔下来**
- 📍 量子位 · 7月25日 · [原文](https://www.qbitai.com/2026/07/460253.html)
- 概要：新一代模型 Opus 5 实测效果强劲，售价仅约 Fable 5 的一半，在社区引发热议；Anthropic 旗下 Claude Code 的系统提示词也随之大幅精简。
- 影响：更低的定价和更强的性能将压缩中小模型厂商的生存空间，并迫使依赖 Claude API 的产品重新评估成本结构；提示词精简则反映出模型能力提升后对工程化包装的依赖减少。
- **具身智能的「ChatGPT时刻」还没到，科沃斯先把机器人拆开了**
- 📍 量子位 · 7月25日 · [原文](https://www.qbitai.com/2026/07/460234.html)
- 概要：科沃斯在行业普遍追逐人形机器人的背景下，选择拆解并重构其家用机器人产品线，聚焦真实用户需求而非形态模仿。
- 影响：这一思路为具身智能落地提供了务实样本：在通用人形机器人尚未跨过“ChatGPT 时刻”之前，垂直场景的功能性创新更易形成商业闭环，也提示开发者优先考虑 ROI 明确的应用方向。
- **北京说Agent已经能造世界，杭州却说它是刚发明的电灯泡**
- 📍 量子位 · 7月25日 · [原文](https://www.qbitai.com/2026/07/460186.html)
- 概要：围绕 Agent 能力边界，北京工业界认为 Agent 已能“造世界”，而杭州学术界则将其类比为刚发明的电灯泡，双方在 RSS 2026 现场展开观点交锋。
- 影响：工业与学术的认知落差意味着 Agent 产品宣传与实际能力之间可能存在泡沫，技术决策者应警惕过度承诺；这也提示研究者与工程师需建立更统一的评估基准，避免选型时踩坑。


**数据漏斗 · Funnel**

- 收集：97 · 过滤：85 · 去重：2 · 治理：10 · 最终：10

| 数据源 | 收集 | 过滤 | 治理 | 最终 |
| ------ | ----: | ----: | ----: | ----: |
| blogs | 5 | 25 | 5 | 5 |
| chinese_ai | 5 | 15 | 5 | 5 |
| tech_blogs | 0 | 40 | 0 | 0 |
| newsletters | 0 | 2 | 0 | 0 |
| product_updates | 0 | 3 | 0 | 0 |

---

*祝你高效的一天！*

模型：minimax-portal/MiniMax-M3 · 条目：10 · 过滤：0 · 治理：0 · AI/规则enriched：10/0 · 生成时间：2026-07-26T01:27:19.781903+00:00
