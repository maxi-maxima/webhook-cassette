<div align="center">

# Webhook Cassette

**记录、脱敏、检查并重放 webhook 请求测试夹。**

[English](README.md)

</div>

`webhook-cassette` 是一个本地优先 CLI，用来把真实 webhook 样本变成安全、可重放、可提交到仓库的测试 cassette。它读取 raw HTTP 文本或 JSON 请求样本，归一化 headers 和 body，脱敏密钥，并写出可在 CI 中重放的 fixture。

它不是托管 webhook inbox，也不是公网 relay。

## 安装

```bash
npm install -g webhook-cassette
```

## 快速开始

记录 raw webhook 样本：

```bash
webhook-cassette record stripe.http --out cassettes/stripe.json --name stripe-demo
```

检查已脱敏 cassette：

```bash
webhook-cassette inspect cassettes/stripe.json
```

干运行重放：

```bash
webhook-cassette replay cassettes/stripe.json --url http://127.0.0.1:3000/webhook --dry-run
```

生成演示资产：

```bash
webhook-cassette demo --out reports/demo
```

## 原始样本

```http
POST /webhook HTTP/1.1
Content-Type: application/json
Authorization: Bearer ghp_1234567890
Stripe-Signature: t=123,v1=abcdef

{"id":"evt_123","email":"user@example.com","api_key":"sk_live_secret"}
```

## 脱敏 cassette 片段

```json
{
  "version": 1,
  "name": "stripe-demo",
  "requests": [
    {
      "method": "POST",
      "path": "/webhook",
      "headers": {
        "authorization": "[REDACTED]",
        "stripe-signature": "[REDACTED]"
      },
      "body": {
        "id": "evt_123",
        "email": "[REDACTED]",
        "api_key": "[REDACTED]"
      }
    }
  ]
}
```

## 命令

- `record <input> --out cassette.json [--name name]`
- `inspect <cassette.json> [--format markdown|json]`
- `replay <cassette.json> --url <url> [--dry-run]`
- `demo --out reports/demo`

## 开发

```bash
npm install
npm run check
node dist/cli.js demo --out reports/demo
npm pack --dry-run --ignore-scripts
```

## 许可证

MIT
