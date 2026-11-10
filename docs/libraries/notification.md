---
title: Notification Library for Go
description: "Notifications through chat, email, SMS, push, and on-call drivers with fanout and fallback."
repoSlug: notification
repoUrl: https://github.com/goforj/notification
noAutoTitle: true
---

# Notification Library for Go {#notification-library-for-go}

<p align="center">
  <img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/logo.png" width="300" alt="notification logo">
</p>

<p align="center">One Go API for chat, email, SMS, push, and on-call alerts.</p>

<p align="center">
  <a href="https://github.com/goforj/notification/actions/workflows/ci.yml"><img src="https://github.com/goforj/notification/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/goforj/notification/actions/workflows/security.yml"><img src="https://github.com/goforj/notification/actions/workflows/security.yml/badge.svg" alt="Security"></a>
  <a href="https://github.com/goforj/notification/releases/tag/v0.1.0"><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/status.svg" alt="v0.1.0"></a>
  <img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/go.svg" alt="Go 1.24 or newer">
  <a href="https://github.com/goforj/notification/blob/main/LICENSE"><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/license.svg" alt="MIT license"></a>
  <a href="https://github.com/goforj/notification/blob/main/docs/unit-results.json"><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/coverage.svg" alt="Unit statement coverage"></a>
  <a href="https://github.com/goforj/notification/blob/main/docs/unit-results.json"><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/tests.svg" alt="Executed unit tests"></a>
  <a href="https://github.com/goforj/notification/blob/main/docs/integration-results.json"><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/integration-tests.svg" alt="Executed native integration tests"></a>
</p>

<p align="center"><a href="#features">Features</a> · <a href="#quick-start">Quick Start</a> · <a href="#drivers">Drivers</a> · <a href="#installation">Installation</a> · <a href="#runnable-examples">Examples</a> · <a href="#api-index">API</a></p>

## Features {#features}

<table>
<thead><tr><th align="left" width="220">Feature</th><th align="left">What you get</th></tr></thead>
<tbody>
<tr><td width="220" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/intent.svg" width="22" height="22" alt="" align="absmiddle"> <strong>Simple messages</strong></td><td>Send a title and body through a configured driver.</td></tr>
<tr><td width="220" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/policy.svg" width="22" height="22" alt="" align="absmiddle"> <strong>Recipient policy</strong></td><td>Optionally resolve recipients and apply channel preferences and fallback.</td></tr>
<tr><td width="220" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/channels.svg" width="22" height="22" alt="" align="absmiddle"> <strong>Typed channels</strong></td><td>Render channel-specific content with typed renderers and transports.</td></tr>
<tr><td width="220" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/identity.svg" width="22" height="22" alt="" align="absmiddle"> <strong>Explicit identity</strong></td><td>Optional process-local deduplication preserves accepted channels.</td></tr>
<tr><td width="220" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/diagnostics.svg" width="22" height="22" alt="" align="absmiddle"> <strong>Safe diagnostics</strong></td><td>Built-in errors and logs omit endpoints, credentials and message content.</td></tr>
<tr><td width="220" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/testing.svg" width="22" height="22" alt="" align="absmiddle"> <strong>Isolated testing</strong></td><td>Capture messages through the Sender interface.</td></tr>
</tbody>
</table>

## Quick Start {#quick-start}

Requires Go 1.24+. Try the complete example without credentials or an external service:

```sh
git clone --branch v0.1.0 --depth 1 https://github.com/goforj/notification.git
cd notification
go run ./examples/quickstart
```

Configure a driver once, then send a title and body. The [complete program](https://github.com/goforj/notification/blob/main/examples/quickstart/main.go) includes the imports:

```go
driver := log.New(slog.New(slog.NewTextHandler(io.Discard, nil)))
notifier := notification.New(driver)

err := notifier.Send(context.Background(), notification.Message{
	Title: "Ticket updated",
	Body:  "Ticket T-42 has a new owner.",
})
if err != nil {
	panic(err)
}
fmt.Println("message captured")
// message captured
```

The log driver records a local capture without logging message content. Replace it with a provider driver to use the same `Send` call for real notifications. `Send` is synchronous and performs no retries or background work. Success means the driver handled the message, not that the recipient received it.

For your own application, use the [installation commands](#installation) below. The commands select v0.1.0 for the root module and each optional adapter.

## Drivers {#drivers}

<table>
<thead><tr><th align="left" width="260">Driver</th><th align="left">Acceptance</th><th align="left">Verification</th></tr></thead>
<tbody>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-sns.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/sns"><strong>Amazon SNS</strong></a></td><td>Native SNS message ID</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-apns.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/apns"><strong>Apple APNs</strong></a></td><td>HTTP/2 acceptance and request ID</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-apprise.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/apprise"><strong>Apprise API</strong></a></td><td>Non-streaming relay acceptance</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-bark.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/bark"><strong>Bark</strong></a></td><td>Native response code</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-betterstack.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/betterstack"><strong>Better Stack</strong></a></td><td>Native incident ID; actions preserve ID</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-clicksend.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/clicksend"><strong>ClickSend</strong></a></td><td>Native envelope and per-message result</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-dingding.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/dingtalk"><strong>DingTalk</strong></a></td><td>Robot response code</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-discord.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/discord"><strong>Discord</strong></a></td><td>Message ID</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-expo.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/expo"><strong>Expo</strong></a></td><td>Native push ticket; not a delivery receipt</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-feishu.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/feishu"><strong>Feishu</strong></a></td><td>Bot response code</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-fcm.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/fcm"><strong>Firebase Cloud Messaging</strong></a></td><td>Project-scoped native message name</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-firehydrant.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/firehydrant"><strong>FireHydrant</strong></a></td><td>Native Signals acceptance</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-goalert.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/goalert"><strong>GoAlert</strong></a></td><td>Generic Incoming acceptance</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-googlechat.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/googlechat"><strong>Google Chat</strong></a></td><td>Message resource</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-gotify.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/gotify"><strong>Gotify</strong></a></td><td>Message ID and content</td><td>Gotify 3.1.1</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-homeassistant.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/homeassistant"><strong>Home Assistant</strong></a></td><td>Notify service response</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-ifttt.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/ifttt"><strong>IFTTT</strong></a></td><td>Event-trigger acknowledgement</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-ilert.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/ilert"><strong>ilert</strong></a></td><td>HTTP 202 event acceptance</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-incidentio.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/incidentio"><strong>incident.io</strong></a></td><td>Correlated event acceptance</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-jiraservicemanagement.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/jsm"><strong>Jira Service Management</strong></a></td><td>Async request ID</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-join.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/join"><strong>Join</strong></a></td><td>Native success flag</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-line.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/line"><strong>LINE</strong></a></td><td>Push acknowledgement</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-log.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/log"><strong>Log</strong></a></td><td>Local capture</td><td>Local capture</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-email.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/mail"><strong>Mail</strong></a></td><td>Mailer acceptance</td><td>Composition tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-matrix.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/matrix"><strong>Matrix</strong></a></td><td>Event ID; fresh transaction per Send</td><td>Synapse 1.164.2</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-mattermost.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/mattermost"><strong>Mattermost</strong></a></td><td>Native ok acknowledgement</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-nextcloudtalk.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/nextcloudtalk"><strong>Nextcloud Talk</strong></a></td><td>OCS status and message ID</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-ntfy.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/ntfy"><strong>ntfy</strong></a></td><td>Message ID and topic</td><td>ntfy 2.37.2</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-onesignal.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/onesignal"><strong>OneSignal</strong></a></td><td>Native message ID and recipient checks</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-opsgenie.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/opsgenie"><strong>Opsgenie</strong></a></td><td>Async request ID</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-pagerduty.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/pagerduty"><strong>PagerDuty</strong></a></td><td>Event and incident key</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-pagertree.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/pagertree"><strong>PagerTree</strong></a></td><td>Native integration acceptance</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-plivo.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/plivo"><strong>Plivo</strong></a></td><td>Native request and message UUID</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-pushbullet.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/pushbullet"><strong>Pushbullet</strong></a></td><td>Native push ID</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-pushover.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/pushover"><strong>Pushover</strong></a></td><td>Native status and request ID</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-rocketchat.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/rocketchat"><strong>Rocket.Chat</strong></a></td><td>Native success flag</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-signal.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/signal"><strong>Signal relay</strong></a></td><td>Native send timestamp</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-signl4.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/signl4"><strong>SIGNL4</strong></a></td><td>Native webhook acceptance</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-slack.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/slack"><strong>Slack</strong></a></td><td>ok acknowledgement</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-teams.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/teams"><strong>Teams</strong></a></td><td>HTTP acceptance</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-telegram.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/telegram"><strong>Telegram</strong></a></td><td>Message ID</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-telnyx.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/telnyx"><strong>Telnyx</strong></a></td><td>Recipient-correlated message status</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-twilio.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/twilio"><strong>Twilio</strong></a></td><td>Message SID and status</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-vonage.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/vonage"><strong>Vonage</strong></a></td><td>All SMS segments accepted</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-waha.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/waha"><strong>WAHA</strong></a></td><td>HTTP acceptance</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-webpush.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/webpush"><strong>Web Push</strong></a></td><td>Encrypted push-service acceptance</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-webhook.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/webhook"><strong>Webhook</strong></a></td><td>HTTP acceptance</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-wecom.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/wecom"><strong>WeCom</strong></a></td><td>Robot response code</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-whapi.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/whapi"><strong>Whapi</strong></a></td><td>Send acknowledgement</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-whatsapp.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/whatsapp"><strong>WhatsApp Cloud</strong></a></td><td>Native message and recipient acknowledgement</td><td>Protocol tests</td></tr>
<tr><td width="260" nowrap><img src="https://raw.githubusercontent.com/goforj/notification/main/docs/assets/badges/driver-zulip.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/notification/tree/main/driver/zulip"><strong>Zulip</strong></a></td><td>Success result and message ID</td><td>Protocol tests</td></tr>
</tbody>
</table>

All drivers have local tests. ntfy, Gotify and Matrix also pass real-server tests; hosted and paired-session verification remains pending for other providers. See [driver configuration and delivery contracts](https://github.com/goforj/notification/blob/main/docs/drivers.md) for details and [integration evidence](https://github.com/goforj/notification/blob/main/docs/integration-results.json) for exact server versions.

Mail reuses your configured [GoForj Mailer](https://github.com/goforj/mail) for SMTP, SendGrid, Resend, Mailgun, Postmark, or Amazon SES. Teams uses Workflows, LINE uses the Messaging API, and Opsgenie provides legacy integration support.

The root module uses only the standard library. Mail, APNs, SNS and Web Push are optional modules. Drivers own their configured destinations; a `Message` contains only content. Errors preserve cancellation and provider classifications without exposing provider response text. See [delivery contracts](https://github.com/goforj/notification/blob/main/docs/contracts.md) for bounds and ownership.

## Installation {#installation}

Install v0.1.0:

```sh
go get github.com/goforj/notification@v0.1.0
```

All drivers except Mail, APNs, SNS and Web Push are packages in the root module. Import them from `github.com/goforj/notification/driver/<name>`; they need no separate installation.

Install only the optional modules you use:

```sh
# Mail
go get github.com/goforj/notification/driver/mail@v0.1.0

# Apple APNs
go get github.com/goforj/notification/driver/apns@v0.1.0

# Amazon SNS
go get github.com/goforj/notification/driver/sns@v0.1.0

# Web Push
go get github.com/goforj/notification/driver/webpush@v0.1.0
```

Mail borrows an application-owned `*mail.Mailer` and configured recipients. Mail owns sender defaults, email composition and transport. The other optional modules isolate their AWS SDK or cryptographic dependencies from the root module. See [Mail integration](https://github.com/goforj/notification/blob/main/docs/mail.md) and [provider capabilities](https://github.com/goforj/notification/blob/main/docs/provider-capabilities.md) for supported operations and limits.

## Runnable Examples {#runnable-examples}

| Program | Run from the repository root | Demonstrates |
| --- | --- | --- |
| [Quick start](https://github.com/goforj/notification/blob/main/examples/quickstart/main.go) | go run ./examples/quickstart | A title and body through the log driver |
| [Webhook](https://github.com/goforj/notification/blob/main/examples/webhook/main.go) | go run ./examples/webhook | A message sent to a configured local HTTP provider |
| [Mail](https://github.com/goforj/notification/blob/main/examples/mail/main.go) | cd examples/mail && go run . | A real Mail Resend driver and Slack composed through Fanout against local fixtures |
| [Provider catalog](https://github.com/goforj/notification/blob/main/examples/providers/main.go) | go run ./examples/providers | Native root-provider configurations and a push/chat fanout |
| [WhatsApp templates](https://github.com/goforj/notification/blob/main/examples/whatsapp/main.go) | go run ./examples/whatsapp | Explicit approved-template sends against a local fixture |
| [APNs](https://github.com/goforj/notification/blob/main/examples/apns/main.go) | cd examples/apns && go run . | Signed alerts over real HTTP/2 and TLS |
| [SNS](https://github.com/goforj/notification/blob/main/examples/sns/main.go) | cd examples/sns && go run . | A borrowed AWS SDK client and a native local response |
| [Web Push](https://github.com/goforj/notification/blob/main/examples/webpush/main.go) | cd examples/webpush && go run . | Encrypted browser push and VAPID authentication |
| [Fake](https://github.com/goforj/notification/blob/main/examples/fake/main.go) | go run ./examples/fake | Application testing through Sender |
| [Composition](https://github.com/goforj/notification/blob/main/examples/composition/main.go) | go run ./examples/composition | Fanout, conservative fallback and safe retry advice |
| [Custom HTTP transport](https://github.com/goforj/notification/blob/main/examples/transport/main.go) | go run ./examples/transport | Caller-owned transport and TLS trust roots |
| [Decorator](https://github.com/goforj/notification/blob/main/examples/decorator/main.go) | go run ./examples/decorator | Application metrics through SenderFunc |
| [Incident](https://github.com/goforj/notification/blob/main/examples/incident/main.go) | go run ./examples/incident | Stable lifecycle keys with a local PagerDuty protocol fixture |
| [Advanced fallback](https://github.com/goforj/notification/blob/main/examples/fallback/main.go) | go run ./examples/fallback | Optional recipient planning, fallback, and identity |

These programs run locally without hosted-provider credentials. The test suite executes them and checks their output. Provider examples use local protocol fixtures, which verify request and response handling rather than live delivery.

## API Index {#api-index}

| Category | Functions |
| ---: | --- |
| Construction | [New](#quick-start) |
| Sending | [Notifier.Send](#quick-start) |
| Composition | [Fanout](#composition) · [Fallback](#composition) |
| Custom senders | [SenderFunc.Send](#custom-senders) |
| Errors | [DeliveryError.RetryAfter](#composition) |
| Driver constructors | [notificationsns.New](#notificationsnsnew) · [apns.New](#apnsnew) · [apprise.New](#apprisenew) · [bark.New](#barknew) · [betterstack.New](#betterstacknew) · [clicksend.New](#clicksendnew) · [dingtalk.New](#dingtalknew) · [discord.New](#discordnew) · [expo.New](#exponew) · [feishu.New](#feishunew) · [fcm.New](#fcmnew) · [firehydrant.New](#firehydrantnew) · [goalert.New](#goalertnew) · [googlechat.New](#googlechatnew) · [gotify.New](#gotifynew) · [homeassistant.New](#homeassistantnew) · [ifttt.New](#iftttnew) · [ilert.New](#ilertnew) · [incidentio.New](#incidentionew) · [jsm.New](#jsmnew) · [join.New](#joinnew) · [line.New](#linenew) · [log.New](#lognew) · [notificationmail.New](#notificationmailnew) · [matrix.New](#matrixnew) · [mattermost.New](#mattermostnew) · [nextcloudtalk.New](#nextcloudtalknew) · [ntfy.New](#ntfynew) · [onesignal.New](#onesignalnew) · [opsgenie.New](#opsgenienew) · [pagerduty.New](#pagerdutynew) · [pagertree.New](#pagertreenew) · [plivo.New](#plivonew) · [pushbullet.New](#pushbulletnew) · [pushover.New](#pushovernew) · [rocketchat.New](#rocketchatnew) · [signal.New](#signalnew) · [signl4.New](#signl4new) · [slack.New](#slacknew) · [teams.New](#teamsnew) · [telegram.New](#telegramnew) · [telnyx.New](#telnyxnew) · [twilio.New](#twilionew) · [vonage.New](#vonagenew) · [waha.New](#wahanew) · [webpush.New](#webpushnew) · [webhook.New](#webhooknew) · [wecom.New](#wecomnew) · [whapi.New](#whapinew) · [whatsapp.New](#whatsappnew) · [zulip.New](#zulipnew) |
| Incident lifecycle | [pagerduty.Driver.Trigger](#incident-lifecycle) · [pagerduty.Driver.Acknowledge](#incident-lifecycle) · [pagerduty.Driver.Resolve](#incident-lifecycle) |
| Templates | [whatsapp.Driver.SendTemplate](#whatsapp-cloud) |
| Testing | [notificationfake.New](#application-testing) · [Fake.Messages](#application-testing) |

## Webhook delivery {#webhook-delivery}

The URL is driver configuration. `AllowPrivate` below permits the local test server; the default destination policy rejects private and special addresses.

```go
provider := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusAccepted)
}))
defer provider.Close()

driver, err := webhook.New(webhook.Config{
	URL:          provider.URL,
	AllowPrivate: true,
})
if err != nil {
	panic(err)
}
defer driver.Close()

notifier := notification.New(driver)
err = notifier.Send(context.Background(), notification.Message{
	Title: "Ticket updated",
	Body:  "Ticket T-42 has a new owner.",
})
if err != nil {
	panic(err)
}
fmt.Println("message accepted")
// message accepted
```

## Custom HTTP transport {#custom-http-transport}

Set `HTTPConfig.Transport` to any concurrency-safe `http.RoundTripper`. Drivers borrow it unchanged; the caller owns its configuration and cleanup. This example uses a local TLS server and a certificate pool named `roots`:

```go
transport := &http.Transport{
	TLSClientConfig: &tls.Config{
		RootCAs:    roots,
		MinVersion: tls.VersionTLS12,
	},
	ForceAttemptHTTP2: true,
}
defer transport.CloseIdleConnections()

driver, err := slack.New(slack.Config{
	URL: provider.URL,
	HTTP: notification.HTTPConfig{
		Transport: transport,
	},
})
if err != nil {
	panic(err)
}
defer driver.Close()

err = driver.Send(context.Background(), notification.Message{
	Title: "Ticket updated",
	Body:  "Ticket T-42 has a new owner.",
})
if err != nil {
	panic(err)
}
fmt.Println("accepted through custom transport")
// accepted through custom transport
```

Webhook exposes the same option directly as `webhook.Config.Transport`. The library retains its client timeout, redirect rejection, response body bounds, and safe errors. With an injected transport, dialing, DNS, TLS, proxies, and retries belong to that transport; `AllowPrivate` and `Resolver` apply only to the default transport. See [transport ownership](https://github.com/goforj/notification/blob/main/docs/contracts.md#http-transport-ownership) for details.

## Composition {#composition}

Use `Fanout` to send through every configured destination, or `Fallback` to try destinations in order. Both return a `Sender`, borrow their configured senders, and never retry. Fanout attempts every target with at most eight concurrent calls.

Fallback advances only after permanent rejection, unauthorized access or unsupported rendering. Uncertainty and transient failures stop it to avoid duplicates. Check `ErrOutcomeUnknown` before deciding whether to retry: a server can fail after accepting a notification.

Use compositions directly. Wrap a custom handler with `New` when it needs common validation and safe errors.

```go
chat := notificationfake.New()
push := notificationfake.New()
sender := notification.Fanout(chat, push)
message := notification.Message{
	Title: "Monitor down",
	Body:  "API health check failed.",
}
if err := sender.Send(context.Background(), message); err != nil {
	panic(err)
}
fmt.Println("captured targets:", len(chat.Messages())+len(push.Messages()))
// captured targets: 2

chat.Respond(notification.ErrPermanent)
backup := notification.Fallback(chat, push)
if err := backup.Send(context.Background(), message); err != nil {
	panic(err)
}
fmt.Println("backup captures:", len(push.Messages()))
// backup captures: 2

push.Respond(notification.NewDeliveryError("push", notification.Outcome{
	Status:     notification.Failed,
	RetryAfter: 30 * time.Second,
}, notification.ErrThrottled))
err := notification.New(push).Send(context.Background(), message)
var failure *notification.DeliveryError
if errors.As(err, &failure) {
	fmt.Println("retry advice:", failure.RetryAfter())
	// retry advice: 30s
}

push.Respond(notification.NewDeliveryError("push", notification.Outcome{
	Status: notification.Unknown,
}, notification.ErrRetryable))
err = notification.New(push).Send(context.Background(), message)
if errors.Is(err, notification.ErrOutcomeUnknown) {
	fmt.Println("delivery uncertain: reconcile before retrying")
	// delivery uncertain: reconcile before retrying
}
```

## Custom senders {#custom-senders}

Use `SenderFunc` to adapt an existing service or decorate a configured sender with application metrics or tracing. Preserve the caller's context and returned error. `New` applies validation and safe errors around the custom handler, so invalid messages do not reach it.

```go
driver := notificationfake.New()
var attempts atomic.Int64

instrumented := notification.SenderFunc(func(ctx context.Context, message notification.Message) error {
	attempts.Add(1)
	return driver.Send(ctx, message)
})
notifier := notification.New(instrumented)

err := notifier.Send(context.Background(), notification.Message{
	Title: "Ticket updated",
	Body:  "Ticket T-42 has a new owner.",
})
if err != nil {
	panic(err)
}
fmt.Println("attempted sends:", attempts.Load())
// attempted sends: 1

err = notifier.Send(context.Background(), notification.Message{})
fmt.Println("invalid message:", errors.Is(err, notification.ErrInvalidMessage))
// invalid message: true
fmt.Println("attempted sends:", attempts.Load())
// attempted sends: 1
```

## Incident lifecycle {#incident-lifecycle}

PagerDuty, JSM, legacy Opsgenie, SIGNL4, PagerTree and ilert additionally implement `IncidentSender`. Construct keys from stable scoped IDs and use the same key for trigger, acknowledge and resolve. Ordinary `Send` requires a fixed configured key on these drivers. JSM and Opsgenie return asynchronous acceptance, without polling for completion.

```go
ctx := context.Background()
key := notification.IncidentKey("tenant:42:monitor:17")
err = driver.Trigger(ctx, notification.Incident{
	Key:      key,
	Title:    "API unavailable",
	Body:     "Health check failed.",
	Source:   "health-checks",
	Severity: notification.SeverityCritical,
})
if err != nil {
	panic(err)
}
fmt.Println("trigger accepted by local fixture")
// trigger accepted by local fixture

if err := driver.Acknowledge(ctx, key); err != nil {
	panic(err)
}
if err := driver.Resolve(ctx, key); err != nil {
	panic(err)
}
fmt.Println("acknowledge and resolve use the same stable key")
// acknowledge and resolve use the same stable key
```

## Mail delivery {#mail-delivery}

Reuse the application-owned GoForj Mailer and configure notification recipients once. Mail owns provider credentials, sender defaults, MIME and transport. This example runs real Resend and Slack drivers against local HTTP fixtures, then composes them through Fanout. It sends no hosted email or chat message.

```go
transport, err := mailresend.New(mailresend.Config{
	APIKey:     "local-fixture-key",
	Endpoint:   provider.URL + "/email",
	HTTPClient: provider.Client(),
})
if err != nil {
	panic(err)
}
mailer := mail.New(transport, mail.WithDefaultFrom("sender@example.com", "Helpdesk"))
email := notificationmail.New(mailer, "recipient@example.com")
chat, err := slack.New(slack.Config{
	URL: provider.URL + "/slack",
	HTTP: notification.HTTPConfig{
		AllowPrivate: true,
	},
})
if err != nil {
	panic(err)
}
defer chat.Close()
sender := notification.Fanout(email, chat)
err = sender.Send(context.Background(), notification.Message{
	Title: "Ticket updated",
	Body:  "Ticket T-42 has a new owner.",
})
if err != nil {
	panic(err)
}
fmt.Println("accepted email and chat:", emails.Load(), chats.Load())
// accepted email and chat: 1 1
```

See [Mail integration](https://github.com/goforj/notification/blob/main/docs/mail.md) for provider choices, rich email, lifecycle and verification details.

## Native provider configuration {#native-provider-configuration}

All providers share the same `Sender` interface. Configure destinations once and compose senders with `Fanout` or `Fallback`. The runnable catalog demonstrates root-provider configuration against local protocol fixtures.

```go
connection := notification.HTTPConfig{
	AllowPrivate: true,
}
mobile, err := pushover.New(pushover.Config{
	BaseURL: server.URL + "/pushover",
	Token:   "fixture-application-token",
	User:    "fixture-user-key",
	HTTP:    connection,
})
if err != nil {
	panic(err)
}
defer mobile.Close()
room, err := mattermost.New(mattermost.Config{
	URL:  server.URL + "/mattermost",
	HTTP: connection,
})
if err != nil {
	panic(err)
}
defer room.Close()
sender := notification.Fanout(mobile, room)
err = sender.Send(context.Background(), notification.Message{
	Title: "Ticket updated",
	Body:  "Ticket T-42 has a new owner.",
})
if err != nil {
	panic(err)
}
fmt.Println("accepted through push and chat:", accepted.Load())
// accepted through push and chat: 2
```

## Application push {#application-push}

APNs owns and refreshes its provider JWT, or borrows an explicitly configured certificate transport. SNS borrows an AWS SDK v2 publisher, preserving the SDK credential model. Web Push encrypts the standard browser subscription payload and signs VAPID authentication. These optional modules do not add dependencies to the root module.

### Apple APNs {#apple-apns}

```go
driver, err := apns.New(apns.Config{
	Key:         key,
	KeyID:       "KEY0000042",
	TeamID:      "TEAM000042",
	Topic:       "example.app",
	DeviceToken: strings.Repeat("ab", 32),
	BaseURL:     service.URL,
	HTTP: notification.HTTPConfig{
		Transport: service.Client().Transport,
	},
})
if err != nil {
	panic(err)
}
defer driver.Close()
err = driver.Send(context.Background(), notification.Message{
	Title: "Ticket updated",
	Body:  "Ticket T-42 has a new owner.",
})
if err != nil {
	panic(err)
}
fmt.Println("APNs accepted over HTTP/2")
// APNs accepted over HTTP/2
```

### Amazon SNS {#amazon-sns}

```go
publisher := sns.New(sns.Options{
	Region:       "us-east-1",
	BaseEndpoint: aws.String(service.URL),
	HTTPClient:   service.Client(),
	Credentials: aws.CredentialsProviderFunc(func(context.Context) (aws.Credentials, error) {
		return aws.Credentials{
			AccessKeyID:     "fixture",
			SecretAccessKey: "local-fixture-secret",
		}, nil
	}),
})
driver, err := notificationsns.New(notificationsns.Config{
	Client:   publisher,
	TopicARN: "arn:aws:sns:us-east-1:123456789012:alerts",
})
if err != nil {
	panic(err)
}
err = driver.Send(context.Background(), notification.Message{
	Title: "Ticket updated",
	Body:  "Ticket T-42 has a new owner.",
})
if err != nil {
	panic(err)
}
fmt.Println("SNS accepted through the borrowed AWS client")
// SNS accepted through the borrowed AWS client
```

### Web Push {#web-push}

```go
driver, err := webpush.New(webpush.Config{
	Subscription:    subscription,
	Subscriber:      "helpdesk@example.com",
	VAPIDPrivateKey: base64.RawURLEncoding.EncodeToString(signingKey.Bytes()),
	VAPIDPublicKey:  base64.RawURLEncoding.EncodeToString(signingKey.PublicKey().Bytes()),
	TTL:             60,
	Urgency:         webpush.UrgencyHigh,
	HTTP: notification.HTTPConfig{
		Transport: service.Client().Transport,
	},
})
if err != nil {
	panic(err)
}
defer driver.Close()
err = driver.Send(context.Background(), notification.Message{
	Title: "Ticket updated",
	Body:  "Ticket T-42 has a new owner.",
})
if err != nil {
	panic(err)
}
fmt.Println("encrypted browser push accepted")
// encrypted browser push accepted
```

FCM HTTP v1 accepts a caller-supplied `TokenSource` function for refreshed OAuth access tokens. OneSignal and Expo submit native push requests. Acceptance means the service accepted the request or ticket; the library does not poll delivery receipts.

## WhatsApp Cloud {#whatsapp-cloud}

Ordinary `Send` uses free-form text within the recipient's customer-service window. Use `SendTemplate` with an already approved template outside that window. Configure the Graph API version explicitly. The library does not create templates or verify service-window eligibility.

```go
driver, err := whatsapp.New(whatsapp.Config{
	Token:         "local-fixture-token",
	PhoneNumberID: "123456789",
	To:            "+12125550101",
	APIVersion:    "v24.0",
	BaseURL:       service.URL,
	HTTP: notification.HTTPConfig{
		AllowPrivate: true,
	},
})
if err != nil {
	panic(err)
}
defer driver.Close()
err = driver.SendTemplate(context.Background(), whatsapp.Template{
	Name:     "ticket_updated",
	Language: "en_US",
	BodyParameters: []string{
		"T-42",
	},
})
if err != nil {
	panic(err)
}
fmt.Println("accepted WhatsApp template:", accepted.Load())
// accepted WhatsApp template: 1
```

## Application testing {#application-testing}

Application services depend on `notification.Sender`. The fake validates and captures messages without contacting providers. Use `fake.Respond(err)` to test a failure.

```go
fake := notificationfake.New()
var sender notification.Sender = fake

err := sender.Send(context.Background(), notification.Message{
	Title: "Ticket updated",
	Body:  "Ticket T-42 has a new owner.",
})
if err != nil {
	panic(err)
}
fmt.Println("captured messages:", len(fake.Messages()))
// captured messages: 1
```

## Advanced dispatch {#advanced-dispatch}

Applications that need recipient lookup, preferences, localized templates, per-recipient fallback, or deduplication can use `NewDispatcher`. These capabilities are optional and keep their explicit delivery results. Use `Fallback` for ordered configured destinations; use `NewDispatcher` when fallback must follow application recipient policy. See [advanced dispatch](https://github.com/goforj/notification/blob/main/docs/advanced.md) for the complete runnable example and migration from the earlier API.

## Driver constructors {#driver-constructors}

The API index includes every driver in the [driver table](#drivers). These constructor expressions are extracted from the executable programs in [Runnable Examples](#runnable-examples). Their local fixture URLs, HTTP settings, credentials and borrowed clients are defined in those programs. Replace fixture values with your own configuration, and handle returned errors and resource ownership as shown in the complete examples.

### notificationsns.New {#notificationsnsnew}

```go
notificationsns.New(notificationsns.Config{
	Client:   publisher,
	TopicARN: "arn:aws:sns:us-east-1:123456789012:alerts",
})
```

### apns.New {#apnsnew}

```go
apns.New(apns.Config{
	Key:         key,
	KeyID:       "KEY0000042",
	TeamID:      "TEAM000042",
	Topic:       "example.app",
	DeviceToken: strings.Repeat("ab", 32),
	BaseURL:     service.URL,
	HTTP: notification.HTTPConfig{
		Transport: service.Client().Transport,
	},
})
```

### apprise.New {#apprisenew}

```go
apprise.New(apprise.Config{
	URL:      baseURL + "/apprise",
	Key:      "fixture",
	Tag:      "alerts",
	Username: "fixture",
	Password: "secret",
	HTTP:     connection,
})
```

### bark.New {#barknew}

```go
bark.New(bark.Config{
	URL:       baseURL + "/bark",
	DeviceKey: "fixture",
	Group:     "alerts",
	HTTP:      connection,
})
```

### betterstack.New {#betterstacknew}

```go
betterstack.New(betterstack.Config{
	BaseURL:        baseURL + "/betterstack",
	Token:          "fixture",
	RequesterEmail: "user@example.com",
	PolicyID:       "policy",
	TeamName:       "Helpdesk",
	Email:          true,
	HTTP:           connection,
})
```

### clicksend.New {#clicksendnew}

```go
clicksend.New(clicksend.Config{
	BaseURL:  baseURL + "/clicksend",
	Username: "fixture",
	APIKey:   "secret",
	From:     "Helpdesk",
	To:       "+12125550101",
	HTTP:     connection,
})
```

### dingtalk.New {#dingtalknew}

```go
dingtalk.New(dingtalk.Config{
	URL:  baseURL + "/dingtalk",
	HTTP: connection,
})
```

### discord.New {#discordnew}

```go
discord.New(discord.Config{
	URL:  baseURL + "/discord",
	HTTP: connection,
})
```

### expo.New {#exponew}

```go
expo.New(expo.Config{
	BaseURL:     baseURL + "/expo",
	PushToken:   "ExpoPushToken[fixture]",
	AccessToken: "fixture",
	HTTP:        connection,
})
```

### feishu.New {#feishunew}

```go
feishu.New(feishu.Config{
	URL:  baseURL + "/feishu",
	HTTP: connection,
})
```

### fcm.New {#fcmnew}

```go
fcm.New(fcm.Config{
	BaseURL:     baseURL + "/fcm",
	ProjectID:   "project",
	DeviceToken: "device",
	TokenSource: func(context.Context) (string, error) { return "fixture", nil },
	HTTP:        connection,
})
```

### firehydrant.New {#firehydrantnew}

```go
firehydrant.New(firehydrant.Config{
	URL:  baseURL + "/firehydrant",
	Key:  "monitor/42",
	HTTP: connection,
})
```

### goalert.New {#goalertnew}

```go
goalert.New(goalert.Config{
	URL:   baseURL + "/goalert",
	Token: "fixture",
	Key:   "monitor/42",
	HTTP:  connection,
})
```

### googlechat.New {#googlechatnew}

```go
googlechat.New(googlechat.Config{
	URL:  baseURL + "/googlechat",
	HTTP: connection,
})
```

### gotify.New {#gotifynew}

```go
gotify.New(gotify.Config{
	URL:      baseURL + "/gotify",
	Token:    "fixture",
	Priority: 5,
	HTTP:     connection,
})
```

### homeassistant.New {#homeassistantnew}

```go
homeassistant.New(homeassistant.Config{
	URL:     baseURL + "/homeassistant",
	Token:   "fixture",
	Service: "mobile_app_phone",
	HTTP:    connection,
})
```

### ifttt.New {#iftttnew}

```go
ifttt.New(ifttt.Config{
	BaseURL: baseURL + "/ifttt",
	Key:     "fixture",
	Event:   "ticket_updated",
	HTTP:    connection,
})
```

### ilert.New {#ilertnew}

```go
ilert.New(ilert.Config{
	URL:            baseURL + "/ilert",
	IntegrationKey: "fixture",
	Key:            "monitor/42",
	HTTP:           connection,
})
```

### incidentio.New {#incidentionew}

```go
incidentio.New(incidentio.Config{
	BaseURL:  baseURL + "/incidentio",
	Token:    "fixture",
	SourceID: "source",
	Key:      "monitor/42",
	HTTP:     connection,
})
```

### jsm.New {#jsmnew}

```go
jsm.New(jsm.Config{
	BaseURL: baseURL + "/jsm",
	CloudID: "cloud",
	Email:   "bot@example.com",
	Token:   "fixture",
	Key:     "monitor/42",
	HTTP:    connection,
})
```

### join.New {#joinnew}

```go
join.New(join.Config{
	BaseURL:  baseURL + "/join",
	APIKey:   "fixture",
	DeviceID: "device",
	HTTP:     connection,
})
```

### line.New {#linenew}

```go
line.New(line.Config{
	BaseURL: baseURL + "/line",
	Token:   "fixture",
	To:      "U00000000000000000000000000000000",
	HTTP:    connection,
})
```

### log.New {#lognew}

```go
log.New(slog.New(slog.NewTextHandler(io.Discard, nil)))
```

### notificationmail.New {#notificationmailnew}

```go
notificationmail.New(mailer, "recipient@example.com")
```

### matrix.New {#matrixnew}

```go
matrix.New(matrix.Config{
	URL:    baseURL + "/matrix",
	Token:  "fixture",
	RoomID: "!room:example.com",
	HTTP:   connection,
})
```

### mattermost.New {#mattermostnew}

```go
mattermost.New(mattermost.Config{
	URL:  baseURL + "/mattermost",
	HTTP: connection,
})
```

### nextcloudtalk.New {#nextcloudtalknew}

```go
nextcloudtalk.New(nextcloudtalk.Config{
	URL:       baseURL + "/nextcloudtalk",
	Username:  "fixture",
	Password:  "secret",
	RoomToken: "room42",
	HTTP:      connection,
})
```

### ntfy.New {#ntfynew}

```go
ntfy.New(ntfy.Config{
	URL:   baseURL + "/ntfy",
	Topic: "alerts",
	HTTP:  connection,
})
```

### onesignal.New {#onesignalnew}

```go
onesignal.New(onesignal.Config{
	BaseURL:        baseURL + "/onesignal",
	AppID:          "application",
	Token:          "fixture",
	SubscriptionID: "device",
	HTTP:           connection,
})
```

### opsgenie.New {#opsgenienew}

```go
opsgenie.New(opsgenie.Config{
	BaseURL: baseURL + "/opsgenie",
	Token:   "fixture",
	Key:     "monitor/42",
	HTTP:    connection,
})
```

### pagerduty.New {#pagerdutynew}

```go
pagerduty.New(pagerduty.Config{
	RoutingKey: strings.Repeat("a", 32),
	URL:        server.URL,
	HTTP: notification.HTTPConfig{
		AllowPrivate: true,
	},
})
```

### pagertree.New {#pagertreenew}

```go
pagertree.New(pagertree.Config{
	URL:  baseURL + "/pagertree",
	Key:  "monitor/42",
	HTTP: connection,
})
```

### plivo.New {#plivonew}

```go
plivo.New(plivo.Config{
	BaseURL:   baseURL + "/plivo",
	AuthID:    "fixture",
	AuthToken: "secret",
	From:      "+12125550100",
	To:        "+12125550101",
	HTTP:      connection,
})
```

### pushbullet.New {#pushbulletnew}

```go
pushbullet.New(pushbullet.Config{
	BaseURL:  baseURL + "/pushbullet",
	Token:    "fixture",
	DeviceID: "device",
	HTTP:     connection,
})
```

### pushover.New {#pushovernew}

```go
pushover.New(pushover.Config{
	BaseURL: baseURL + "/pushover",
	Token:   "fixture",
	User:    "user",
	Device:  "phone",
	HTTP:    connection,
})
```

### rocketchat.New {#rocketchatnew}

```go
rocketchat.New(rocketchat.Config{
	URL:  baseURL + "/rocketchat",
	HTTP: connection,
})
```

### signal.New {#signalnew}

```go
signal.New(signal.Config{
	URL:       baseURL + "/signal",
	Number:    "+12125550100",
	Recipient: "+12125550101",
	Token:     "fixture",
	HTTP:      connection,
})
```

### signl4.New {#signl4new}

```go
signl4.New(signl4.Config{
	URL:  baseURL + "/signl4",
	Key:  "monitor/42",
	HTTP: connection,
})
```

### slack.New {#slacknew}

```go
slack.New(slack.Config{
	URL: provider.URL,
	HTTP: notification.HTTPConfig{
		Transport: transport,
	},
})
```

### teams.New {#teamsnew}

```go
teams.New(teams.Config{
	URL:  baseURL + "/teams",
	HTTP: connection,
})
```

### telegram.New {#telegramnew}

```go
telegram.New(telegram.Config{
	BaseURL: baseURL + "/telegram",
	Token:   "123456:fixture",
	ChatID:  "42",
	HTTP:    connection,
})
```

### telnyx.New {#telnyxnew}

```go
telnyx.New(telnyx.Config{
	BaseURL:            baseURL + "/telnyx",
	Token:              "fixture",
	From:               "+12125550100",
	To:                 "+12125550101",
	MessagingProfileID: "profile",
	HTTP:               connection,
})
```

### twilio.New {#twilionew}

```go
twilio.New(twilio.Config{
	BaseURL:    baseURL + "/twilio",
	AccountSID: "AC00000000000000000000000000000000",
	AuthToken:  "fixture",
	From:       "+12125550100",
	To:         "+12125550101",
	HTTP:       connection,
})
```

### vonage.New {#vonagenew}

```go
vonage.New(vonage.Config{
	BaseURL:   baseURL + "/vonage",
	APIKey:    "fixture1",
	APISecret: "secret",
	From:      "Helpdesk",
	To:        "+12125550101",
	HTTP:      connection,
})
```

### waha.New {#wahanew}

```go
waha.New(waha.Config{
	URL:     baseURL + "/waha",
	APIKey:  "fixture",
	Session: "default",
	ChatID:  "12125550101@c.us",
	HTTP:    connection,
})
```

### webpush.New {#webpushnew}

```go
webpush.New(webpush.Config{
	Subscription:    subscription,
	Subscriber:      "helpdesk@example.com",
	VAPIDPrivateKey: base64.RawURLEncoding.EncodeToString(signingKey.Bytes()),
	VAPIDPublicKey:  base64.RawURLEncoding.EncodeToString(signingKey.PublicKey().Bytes()),
	TTL:             60,
	Urgency:         webpush.UrgencyHigh,
	HTTP: notification.HTTPConfig{
		Transport: service.Client().Transport,
	},
})
```

### webhook.New {#webhooknew}

```go
webhook.New(webhook.Config{
	URL:          provider.URL,
	AllowPrivate: true,
})
```

### wecom.New {#wecomnew}

```go
wecom.New(wecom.Config{
	URL:  baseURL + "/wecom",
	HTTP: connection,
})
```

### whapi.New {#whapinew}

```go
whapi.New(whapi.Config{
	BaseURL: baseURL + "/whapi",
	Token:   "fixture",
	To:      "12125550101",
	HTTP:    connection,
})
```

### whatsapp.New {#whatsappnew}

```go
whatsapp.New(whatsapp.Config{
	BaseURL:       baseURL + "/whatsapp",
	Token:         "fixture",
	PhoneNumberID: "123456789",
	To:            "+12125550101",
	APIVersion:    "v24.0",
	HTTP:          connection,
})
```

### zulip.New {#zulipnew}

```go
zulip.New(zulip.Config{
	URL:     baseURL + "/zulip",
	Email:   "bot@example.com",
	APIKey:  "fixture",
	Channel: "alerts",
	Topic:   "Tickets",
	HTTP:    connection,
})
```

## Development {#development}

```sh
make test
make test-race
make test-integration # Requires Docker.
make vet
make check-generated
make security
```

Documentation is generated by the Go tools in `docs/`, using the runnable examples as the source of truth. `make test` validates every module, executes the example programs, and enforces exact 100% library unit statement coverage. See [development and release](https://github.com/goforj/notification/blob/main/docs/development.md) for independent module tags, [delivery contracts](https://github.com/goforj/notification/blob/main/docs/contracts.md) for guarantees and limits, and the [API review](https://github.com/goforj/notification/blob/main/docs/api-review.md) for the simplicity and composition decisions.

See the [current release gates](https://github.com/goforj/notification/blob/main/docs/release-readiness.md) for completed checks and outstanding verification.

The [original framework proposal](https://github.com/goforj/notification/blob/main/docs/designs/framework-proposal.md) records the larger roadmap. Durable Queue integration, SQL persistence, inboxes, and GoForj generation remain future work.
