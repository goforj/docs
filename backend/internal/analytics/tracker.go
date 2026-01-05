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
	"sync"
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
	mu            sync.Mutex
	queue         []queuedEvent
}

func NewTracker(logger *logger.AppLogger) *Tracker {
	measurementID := strings.TrimSpace(env.Get(gaMeasurementIDEnv, ""))
	apiSecret := strings.TrimSpace(env.Get(gaAPISecretEnv, ""))
	enabled := measurementID != "" && apiSecret != ""
	tracker := &Tracker{
		logger:        logger,
		measurementID: measurementID,
		apiSecret:     apiSecret,
		client: &http.Client{
			Timeout: 2 * time.Second,
		},
		enabled: enabled,
	}
	if enabled {
		tracker.startFlushLoop()
	}
	return tracker
}

func (t *Tracker) Enabled() bool {
	return t != nil && t.enabled
}

func (t *Tracker) TrackExampleRun(ctx context.Context, repo string, example string, clientIP string, userAgent string) {
	if !t.Enabled() {
		return
	}

	t.enqueue(queuedEvent{
		clientID: clientID(clientIP, userAgent),
		event: gaEvent{
			Name: "example_run",
			Params: map[string]any{
				"repo":    repo,
				"example": example,
			},
		},
	})
}

type gaEventPayload struct {
	ClientID string    `json:"client_id"`
	Events   []gaEvent `json:"events"`
}

type gaEvent struct {
	Name   string         `json:"name"`
	Params map[string]any `json:"params,omitempty"`
}

type queuedEvent struct {
	clientID string
	event    gaEvent
}

func (t *Tracker) enqueue(item queuedEvent) {
	t.mu.Lock()
	t.queue = append(t.queue, item)
	shouldFlush := len(t.queue) >= 25
	t.mu.Unlock()
	if shouldFlush {
		t.flushBatch()
	}
}

func (t *Tracker) startFlushLoop() {
	ticker := time.NewTicker(2 * time.Second)
	go func() {
		for range ticker.C {
			t.flushBatch()
		}
	}()
}

func (t *Tracker) flushBatch() {
	if !t.Enabled() {
		return
	}
	items := t.drainQueue(25)
	if len(items) == 0 {
		return
	}

	batches := groupByClient(items)
	for clientID, events := range batches {
		payload := gaEventPayload{
			ClientID: clientID,
			Events:   events,
		}
		t.send(payload)
	}
}

func (t *Tracker) drainQueue(limit int) []queuedEvent {
	t.mu.Lock()
	defer t.mu.Unlock()
	if len(t.queue) == 0 {
		return nil
	}
	if limit <= 0 || len(t.queue) <= limit {
		items := make([]queuedEvent, len(t.queue))
		copy(items, t.queue)
		t.queue = nil
		return items
	}
	items := make([]queuedEvent, limit)
	copy(items, t.queue[:limit])
	t.queue = t.queue[limit:]
	return items
}

func groupByClient(items []queuedEvent) map[string][]gaEvent {
	batches := make(map[string][]gaEvent)
	for _, item := range items {
		batches[item.clientID] = append(batches[item.clientID], item.event)
	}
	return batches
}

func (t *Tracker) send(payload gaEventPayload) {
	body, err := json.Marshal(payload)
	if err != nil {
		t.logger.Debug().Err(err).Msg("GA4: failed to marshal payload")
		return
	}

	url := fmt.Sprintf("https://www.google-analytics.com/mp/collect?measurement_id=%s&api_secret=%s", t.measurementID, t.apiSecret)
	req, err := http.NewRequestWithContext(context.Background(), http.MethodPost, url, bytes.NewReader(body))
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
