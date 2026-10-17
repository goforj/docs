package benchmarks

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// TestMailFixtureResponse verifies each provider-shaped success and rejects malformed fixture calls.
func TestMailFixtureResponse(t *testing.T) {
	for _, tc := range []struct {
		name, method, path, body, contentType string
		status                                int
	}{
		{"resend", http.MethodPost, "/resend", `{"to":["reader@bench.example.com"]}`, "application/json", 200},
		{"postmark", http.MethodPost, "/postmark", `{"To":"reader@bench.example.com"}`, "application/json", 200},
		{"sendgrid", http.MethodPost, "/sendgrid", `{"personalizations":[]}`, "application/json", 202},
		{"mailgun", http.MethodPost, "/v3/bench.example.com/messages", "from=sender&to=reader", "multipart/form-data", 200},
		{"ses", http.MethodPost, "/v2/email/outbound-emails", `{"Content":{}}`, "application/json", 200},
		{"method", http.MethodGet, "/resend", "{}", "application/json", 405},
		{"empty", http.MethodPost, "/resend", "", "application/json", 400},
		{"invalid JSON", http.MethodPost, "/resend", "{", "application/json", 400},
		{"unknown endpoint", http.MethodPost, "/unknown", "{}", "application/json", 404},
	} {
		t.Run(tc.name, func(t *testing.T) {
			request := httptest.NewRequest(tc.method, tc.path, strings.NewReader(tc.body))
			request.Header.Set("Content-Type", tc.contentType)
			response := httptest.NewRecorder()
			mailFixtureResponse(response, request)
			if response.Code != tc.status {
				t.Fatalf("status: got %d, want %d", response.Code, tc.status)
			}
		})
	}
}
