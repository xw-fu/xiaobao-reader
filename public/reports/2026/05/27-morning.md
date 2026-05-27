# 晓报 · 早报 — 2026-05-27

*早安！以下是今日要闻速览。*

## 今日要点

Raymond Chen 解释了 C++/WinRT 与 C#、JavaScript 在处理 Windows Runtime 异步操作时的哲学差异：前者不支持对同一协程多次 await，因为 C++ 对象默认不可复制、重启协程会引发未定义行为，而后者语言可隐式克隆协程状态。

---

## 开发生态

- **If C# and JavaScript lets me await a Windows Runtime asynchronous operation more than once, why not C++/WinRT?**
- 📍 OldNewThing · 5月26日 · [原文](https://devblogs.microsoft.com/oldnewthing/20260526-00/?p=112354)
- 概要：Raymond Chen 解释了 C++/WinRT 与 C#、JavaScript 在处理 Windows Runtime 异步操作时的哲学差异：前者不支持对同一协程多次 await，因为 C++ 对象默认不可复制、重启协程会引发未定义行为，而后者语言可隐式克隆协程状态。
- 影响：C++ 开发者需注意：协程只能 await 一次，重复使用需自行实现克隆机制。这反映了 C++ 对内存安全与对象所有权的严格把控，与托管语言的便利性形成鲜明对比，影响跨语言 API 设计理解。


**数据漏斗 · Funnel**

- 收集：15 · 过滤：14 · 去重：0 · 治理：1 · 最终：1

| 数据源 | 收集 | 过滤 | 治理 | 最终 |
| ------ | ----: | ----: | ----: | ----: |
| blogs | 1 | 4 | 1 | 1 |
| chinese_ai | 0 | 10 | 0 | 0 |

---

*祝你高效的一天！*

模型：minimax-portal/MiniMax-M2.7 · 条目：1 · 过滤：0 · 治理：0 · AI/规则enriched：1/0 · 生成时间：2026-05-27T01:29:08.554406+00:00
