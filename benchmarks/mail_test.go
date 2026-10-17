package benchmarks

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/goforj/mail"
	"github.com/goforj/mail/mailfake"
	"github.com/goforj/mail/maillog"
	"github.com/goforj/mail/mailmailgun"
	"github.com/goforj/mail/mailpostmark"
	"github.com/goforj/mail/mailresend"
	"github.com/goforj/mail/mailsendgrid"
	"github.com/goforj/mail/mailses"
	"github.com/goforj/mail/mailsmtp"
)

// TestMailHTTPFixtureProcess runs local provider-shaped acknowledgements in another process.
// Keeping the fixture separate prevents its allocations from entering client-side B/op.
func TestMailHTTPFixtureProcess(t *testing.T) {
	if os.Getenv("FORJ_MAIL_FIXTURE_PROCESS") != "1" {
		t.Skip("subprocess fixture")
	}
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	fmt.Println("http://" + listener.Addr().String())
	server := &http.Server{Handler: http.HandlerFunc(mailFixtureResponse), ReadHeaderTimeout: 5 * time.Second}
	if err := server.Serve(listener); err != nil && err != http.ErrServerClosed {
		t.Fatal(err)
	}
}

// mailFixtureResponse consumes outbound payloads before acknowledging local acceptance.
func mailFixtureResponse(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST required", http.StatusMethodNotAllowed)
		return
	}
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil || len(body) == 0 {
		http.Error(w, "message required", http.StatusBadRequest)
		return
	}
	if strings.Contains(r.Header.Get("Content-Type"), "application/json") && !json.Valid(body) {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	switch r.URL.Path {
	case "/resend":
		io.WriteString(w, `{"id":"local-benchmark"}`)
	case "/postmark":
		io.WriteString(w, `{"MessageID":"local-benchmark","ErrorCode":0}`)
	case "/sendgrid":
		w.WriteHeader(http.StatusAccepted)
	case "/v3/bench.example.com/messages":
		io.WriteString(w, `{"id":"local-benchmark","message":"Queued"}`)
	case "/v2/email/outbound-emails":
		io.WriteString(w, `{"MessageId":"local-benchmark"}`)
	default:
		http.Error(w, "unknown fixture endpoint", http.StatusNotFound)
	}
}

// mailEndpoint starts a child test binary so provider fixture work is outside measured memory.
func mailEndpoint(b *testing.B) string {
	b.Helper()
	command := exec.Command(os.Args[0], "-test.run=^TestMailHTTPFixtureProcess$")
	command.Env = append(os.Environ(), "FORJ_MAIL_FIXTURE_PROCESS=1")
	command.Stderr = os.Stderr
	output, err := command.StdoutPipe()
	if err != nil {
		b.Fatal(err)
	}
	if err := command.Start(); err != nil {
		b.Fatal(err)
	}
	b.Cleanup(func() { _ = command.Process.Kill(); _ = command.Wait() })
	ready := make(chan string, 1)
	go func() {
		scanner := bufio.NewScanner(output)
		if scanner.Scan() {
			ready <- scanner.Text()
		} else {
			ready <- ""
		}
	}()
	select {
	case endpoint := <-ready:
		if !strings.HasPrefix(endpoint, "http://127.0.0.1:") {
			b.Fatalf("fixture did not start: %q", endpoint)
		}
		return endpoint
	case <-time.After(10 * time.Second):
		b.Fatal("fixture startup timed out")
	}
	return ""
}

// benchmarkMessage provides the same dual-body message and 4 KiB attachment to every driver.
func benchmarkMessage() mail.Message {
	return mail.Message{
		From:        &mail.Recipient{Email: "no-reply@bench.example.com", Name: "GoForj"},
		To:          []mail.Recipient{{Email: "reader@bench.example.com", Name: "Reader"}},
		Subject:     "Benchmark notification",
		Text:        strings.Repeat("A benchmark notification. ", 10),
		HTML:        "<p>" + strings.Repeat("A benchmark notification. ", 10) + "</p>",
		Attachments: []mail.Attachment{mail.AttachmentFromBytes("report.bin", "application/octet-stream", make([]byte, 4096))},
	}
}

// BenchmarkMailSend measures successful client send return, never real provider delivery.
func BenchmarkMailSend(b *testing.B) {
	for _, name := range []string{"smtp", "resend", "postmark", "mailgun", "sendgrid", "ses", "log", "fake"} {
		b.Run(name, func(b *testing.B) {
			var driver mail.Driver
			var fake *mailfake.Driver
			var err error
			client := &http.Client{Timeout: 10 * time.Second}
			b.Cleanup(client.CloseIdleConnections)
			switch name {
			case "smtp":
				address := os.Getenv("FORJ_BENCH_SMTP_ADDR")
				if address == "" {
					b.Fatal("FORJ_BENCH_SMTP_ADDR is required")
				}
				host, port, parseErr := net.SplitHostPort(address)
				if parseErr != nil {
					b.Fatal(parseErr)
				}
				number, parseErr := strconv.Atoi(port)
				if parseErr != nil {
					b.Fatal(parseErr)
				}
				driver, err = mailsmtp.New(mailsmtp.Config{Host: host, Port: number})
			case "resend":
				driver, err = mailresend.New(mailresend.Config{APIKey: "local-fixture", Endpoint: mailEndpoint(b) + "/resend", HTTPClient: client})
			case "postmark":
				driver, err = mailpostmark.New(mailpostmark.Config{ServerToken: "local-fixture", Endpoint: mailEndpoint(b) + "/postmark", HTTPClient: client})
			case "mailgun":
				driver, err = mailmailgun.New(mailmailgun.Config{APIKey: "local-fixture", Domain: "bench.example.com", Endpoint: mailEndpoint(b), HTTPClient: client})
			case "sendgrid":
				driver, err = mailsendgrid.New(mailsendgrid.Config{APIKey: "local-fixture", Endpoint: mailEndpoint(b) + "/sendgrid", HTTPClient: client})
			case "ses":
				driver, err = mailses.New(mailses.Config{Region: "us-east-1", AccessKeyID: "local-fixture", SecretAccessKey: "local-fixture", Endpoint: mailEndpoint(b), HTTPClient: client})
			case "log":
				driver = maillog.New(io.Discard, maillog.WithBodies(true))
			case "fake":
				fake = mailfake.New()
				driver = fake
			}
			if err != nil {
				b.Fatal(err)
			}
			mailer := mail.New(driver)
			message := benchmarkMessage()
			ctx := context.Background()
			if err := mailer.Send(ctx, message); err != nil {
				b.Fatal(err)
			}
			sent := 0
			b.ReportAllocs()
			for b.Loop() {
				if err := mailer.Send(ctx, message); err != nil {
					b.Fatal(err)
				}
				sent++
				// Bound retained test messages; amortized reset cost remains in the fake result.
				if fake != nil && sent%128 == 0 {
					fake.Reset()
				}
			}
		})
	}
}
