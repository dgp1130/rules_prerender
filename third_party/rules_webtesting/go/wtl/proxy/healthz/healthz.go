// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Package healthz provides an HTTPHandler that always returns the string "ok".
package healthz

import (
	"context"
	"io"
	"net/http"

	"github.com/bazelbuild/rules_webtesting/go/httphelper"
	"github.com/bazelbuild/rules_webtesting/go/wtl/proxy"
)

type healthz struct{}

// HTTPHandlerProvider returns a HTTPHandlerProvider for handling healthz requests.
func HTTPHandlerProvider(*proxy.Proxy) (proxy.HTTPHandler, error) {
	return &healthz{}, nil
}

func (h *healthz) Shutdown(context.Context) error {
	return nil
}

func (h *healthz) ServeHTTP(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	httphelper.SetDefaultResponseHeaders(w.Header())
	w.WriteHeader(http.StatusOK)
	io.WriteString(w, "ok")
}

func (*healthz) Name() string {
	return "healthz http handler"
}

func (*healthz) Healthy(context.Context) error {
	return nil
}
