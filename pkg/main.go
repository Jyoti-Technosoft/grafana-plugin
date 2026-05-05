package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

type datasourceOpts struct {
	APIURL string `json:"apiUrl"`
}

type hlcQuery struct {
	Target      string `json:"target"`
	Capture     string `json:"capture"`
	Metric      string `json:"metric"`
	Measurement string `json:"measurement"`
	SpikeOnly   bool   `json:"spikeOnly"`
}

type grafanaSeries struct {
	Target     string        `json:"target"`
	Datapoints [][]float64   `json:"datapoints"`
	Tags       map[string]any `json:"tags,omitempty"`
}

type backendClient struct {
	baseURL string
	token   string
	client  *http.Client
}

type hlcDatasource struct{}

func newDatasource(_ context.Context, _ backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	return &hlcDatasource{}, nil
}

func main() {
	if err := datasource.Manage("hlc-datasource-backend", newDatasource, datasource.ManageOpts{}); err != nil {
		log.DefaultLogger.Error(err.Error())
	}
}

func (d *hlcDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()
	client, err := newBackendClient(req.PluginContext.DataSourceInstanceSettings)
	if err != nil {
		return nil, err
	}

	for _, query := range req.Queries {
		res := d.query(ctx, client, query)
		response.Responses[query.RefID] = res
	}

	return response, nil
}

func (d *hlcDatasource) query(ctx context.Context, client *backendClient, query backend.DataQuery) backend.DataResponse {
	var q hlcQuery
	if err := json.Unmarshal(query.JSON, &q); err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, "invalid query payload")
	}

	if strings.TrimSpace(q.Target) == "" || strings.TrimSpace(q.Capture) == "" || strings.TrimSpace(q.Metric) == "" {
		return backend.DataResponse{Frames: data.Frames{}}
	}

	payload := map[string]any{
		"targets": []map[string]any{
			{
				"target":      q.Target,
				"capture":     q.Capture,
				"metric":      q.Metric,
				"measurement": q.Measurement,
				"spikeOnly":   q.SpikeOnly,
			},
		},
		"rangeFrom": query.TimeRange.From.UnixMilli(),
		"rangeTo":   query.TimeRange.To.UnixMilli(),
	}

	body, err := client.post(ctx, "/query", payload)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusInternal, err.Error())
	}

	var seriesList []grafanaSeries
	if err := json.Unmarshal(body, &seriesList); err != nil {
		return backend.ErrDataResponse(backend.StatusInternal, "invalid backend query response")
	}

	frames := make(data.Frames, 0, len(seriesList))
	for _, series := range seriesList {
		times := make([]time.Time, 0, len(series.Datapoints))
		values := make([]float64, 0, len(series.Datapoints))
		for _, point := range series.Datapoints {
			if len(point) < 2 {
				continue
			}
			values = append(values, point[0])
			times = append(times, time.UnixMilli(int64(point[1])))
		}
		frame := data.NewFrame(series.Target,
			data.NewField("Time", nil, times),
			data.NewField(series.Target, nil, values),
		)
		frames = append(frames, frame)
	}

	return backend.DataResponse{Frames: frames}
}

func (d *hlcDatasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	client, err := newBackendClient(req.PluginContext.DataSourceInstanceSettings)
	if err != nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: err.Error(),
		}, nil
	}

	body, err := client.post(ctx, "/health", map[string]any{})
	if err != nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: err.Error(),
		}, nil
	}

	var response struct {
		Status  string `json:"status"`
		Message string `json:"message"`
	}
	_ = json.Unmarshal(body, &response)
	if strings.EqualFold(response.Status, "ok") {
		return &backend.CheckHealthResult{Status: backend.HealthStatusOk, Message: response.Message}, nil
	}
	if response.Message == "" {
		response.Message = "health check failed"
	}
	return &backend.CheckHealthResult{Status: backend.HealthStatusError, Message: response.Message}, nil
}

func (d *hlcDatasource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	client, err := newBackendClient(req.PluginContext.DataSourceInstanceSettings)
	if err != nil {
		return sender.Send(&backend.CallResourceResponse{Status: http.StatusBadRequest, Body: []byte(err.Error())})
	}

	path := strings.TrimPrefix(req.Path, "/")
	switch {
	case path == "health":
		body, postErr := client.post(ctx, "/health", map[string]any{})
		if postErr != nil {
			return sender.Send(&backend.CallResourceResponse{Status: http.StatusBadGateway, Body: []byte(postErr.Error())})
		}
		return sender.Send(&backend.CallResourceResponse{Status: http.StatusOK, Body: body})
	case strings.HasPrefix(path, "variables/"):
		variable := strings.TrimPrefix(path, "variables/")
		var payload map[string]any
		if len(req.Body) > 0 {
			_ = json.Unmarshal(req.Body, &payload)
		}
		if payload == nil {
			payload = map[string]any{}
		}
		body, postErr := client.post(ctx, "/variables/"+url.PathEscape(variable), payload)
		if postErr != nil {
			return sender.Send(&backend.CallResourceResponse{Status: http.StatusBadGateway, Body: []byte(postErr.Error())})
		}
		return sender.Send(&backend.CallResourceResponse{Status: http.StatusOK, Body: body})
	default:
		return sender.Send(&backend.CallResourceResponse{Status: http.StatusNotFound, Body: []byte("resource not found")})
	}
}

func newBackendClient(settings *backend.DataSourceInstanceSettings) (*backendClient, error) {
	if settings == nil {
		return nil, fmt.Errorf("missing datasource settings")
	}
	var opts datasourceOpts
	if err := json.Unmarshal(settings.JSONData, &opts); err != nil {
		return nil, fmt.Errorf("invalid datasource config")
	}

	baseURL := strings.TrimSpace(opts.APIURL)
	if baseURL == "" {
		return nil, fmt.Errorf("apiUrl is required")
	}

	token := strings.TrimSpace(settings.DecryptedSecureJSONData["apiToken"])
	return &backendClient{
		baseURL: strings.TrimRight(baseURL, "/") + "/backend/api/grafana",
		token:   token,
		client:  &http.Client{Timeout: 30 * time.Second},
	}, nil
}

func (c *backendClient) post(ctx context.Context, path string, payload any) ([]byte, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to encode request")
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+path, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to build request")
	}
	req.Header.Set("Content-Type", "application/json")
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("backend unavailable: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		message := strings.TrimSpace(string(respBody))
		if message == "" {
			message = resp.Status
		}
		return nil, fmt.Errorf("backend error: %s", message)
	}
	return respBody, nil
}
