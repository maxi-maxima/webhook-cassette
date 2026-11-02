# 更新日志

## 未发布

- 重放 webhook cassette 时保留已录制的查询字符串。
- 重放前移除已录制的 `Content-Length` header，确保序列化后的正文使用正确长度。
- 将 CI 的 checkout 和 Node setup action 升级到 Node 24 运行时版本。

## 0.1.0 - 2026-06-12

- 首个公开版本。
- 加入 raw HTTP 和 JSON 请求解析。
- 加入基于 key 和 value pattern 的脱敏。
- 加入 cassette 记录、检查、重放和 demo 命令。
