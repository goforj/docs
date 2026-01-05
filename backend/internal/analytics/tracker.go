package analytics

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/goforj/docs/internal/logger"
	"github.com/goforj/env"
)

const (
	gaMeasurementIDEnv = "GA_MEASUREMENT_ID"
	gaAPISecretEnv     = "GA_API_SECRET"
)

type Tracker struct {
	logger        *logger.AppLogger
	measurementID string
	apiSecret     string
	client        *http.Client
	enabled       bool
}

func NewTracker(logger *logger.AppLogger) *Tracker {
	measurementID := strings.TrimSpace(env.Get(gaMeasurementIDEnv, ""))
	apiSecret := strings.TrimSpace(env.Get(gaAPISecretEnv, ""))
	enabled := measurementID != "" && apiSecret != ""
	return &Tracker{
		logger:        logger,
		measurementID: measurementID,
		apiSecret:     apiSecret,
		client: &http.Client{
			Timeout: 2 * time.Second,
		},
		enabled: enabled,
	}
}

func (t *Tracker) Enabled() bool {
	return t != nil && t.enabled
}

func (t *Tracker) TrackExampleRun(ctx context.Context, repo string, example string, clientIP string, userAgent string) {
	if !t.Enabled() {
		return
	}

	payload := gaEventPayload{
		ClientID: clientID(clientIP, userAgent),
		Events: []gaEvent{
			{
				Name: "example_run",
				Params: map[string]any{
					"repo":    repo,
					"example": example,
				},
			},
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		t.logger.Debug().Err(err).Msg("GA4: failed to marshal payload")
		return
	}

	url := fmt.Sprintf("https://www.google-analytics.com/mp/collect?measurement_id=%s&api_secret=%s", t.measurementID, t.apiSecret)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		t.logger.Debug().Err(err).Msg("GA4: failed to build request")
		return
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := t.client.Do(req)
	if err != nil {
		t.logger.Debug().Err(err).Msg("GA4: request failed")
		return
	}
	_ = resp.Body.Close()
	if resp.StatusCode >= 300 {
		t.logger.Debug().Int("status", resp.StatusCode).Msg("GA4: non-2xx response")
	}
}

type gaEventPayload struct {
	ClientID string    `json:"client_id"`
	Events   []gaEvent `json:"events"`
}

type gaEvent struct {
	Name   string         `json:"name"`
	Params map[string]any `json:"params,omitempty"`
}

func clientID(clientIP string, userAgent string) string {
	key := strings.TrimSpace(clientIP) + "|" + strings.TrimSpace(userAgent)
	if strings.TrimSpace(key) == "|" {
		return randomID()
	}
	sum := sha256.Sum256([]byte(key))
	return hex.EncodeToString(sum[:])
}

func randomID() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(b[:])
}
