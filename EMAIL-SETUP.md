# 📧 info@hkadopt.com 開通步驟（Zoho 免費版）

Domain 已買好：**hkadopt.com**（Cloudflare Registrar）✅

## 1. 開 Zoho Mail 免費版

1. 去 [zoho.com/mail](https://www.zoho.com/mail/) 註冊帳號（免費）
2. 揀 **Forever Free Plan**（5 users，網頁版 + 手機 App）
3. 加入 domain：`hkadopt.com`

## 2. 喺 Cloudflare 加 DNS records

Zoho 會要求驗證，去 Cloudflare dashboard → hkadopt.com → DNS → Add record：

| Type | Name | Content | TTL | Proxy |
| --- | --- | --- | --- | --- |
| TXT | @ | `zoho-verification=……`（Zoho 提供） | Auto | DNS only |
| MX | @ | `mx.zoho.com` (priority 10) | Auto | — |
| MX | @ | `mx2.zoho.com` (priority 20) | Auto | — |
| TXT | @ | SPF: `v=spf1 include:zohomail.com ~all` | Auto | — |

⚠️ MX records 一定要係 **DNS only**（灰色雲），唔好 proxy。

## 3. 建立信箱

- Zoho admin → Add user → `info@hkadopt.com`
- 免費 plan 仲有 4 個位（例如 `team@`、`admin@`）
- 設密碼，開 [mail.zoho.com](https://mail.zoho.com) 收發

## 4. 完成

網站已經用緊 `info@hkadopt.com`（About 頁聯絡）。
想 Gmail 收？Zoho → Settings → Mail Accounts → Forwarding → 轉去你 Gmail。

之後 GitHub Pages 都可以用 `hkadopt.com` 做正式網址（DEPLOY.md 有步驟）。
