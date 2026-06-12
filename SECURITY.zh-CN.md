# 安全政策

## 报告问题

如果发现安全问题，请优先通过 GitHub security advisories 报告。

## 范围

`webhook-cassette` 处理可能包含密钥的 webhook 样本。未能脱敏已声明的密钥模式、在指定输出路径之外写文件，或 dry-run replay 仍发送网络请求的问题都属于范围。

## 支持版本

当前 `0.x` 版本线会接收安全修复。
