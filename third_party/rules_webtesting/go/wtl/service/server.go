// Copyright 2016 Google Inc.
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

package service

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/bazelbuild/rules_webtesting/go/errors"
	"github.com/bazelbuild/rules_webtesting/go/healthreporter"
	"github.com/bazelbuild/rules_webtesting/go/httphelper"
	"github.com/bazelbuild/rules_webtesting/go/portpicker"
	"github.com/bazelbuild/rules_webtesting/go/wtl/diagnostics"
)

// Server is a service that starts an external server.
type Server struct {
	*Cmd
	address       string
	port          int
	healthPattern string
	timeout       time.Duration
}

// NewServer creates a new service for starting an external server on the host machine.
// Args should contain {port}, which will be replaced with the selected port number.
func NewServer(name string, d diagnostics.Diagnostics, exe, healthPattern string, xvfb bool, timeout time.Duration, env map[string]string, args ...string) (*Server, error) {
	port, err := portpicker.PickUnusedPort()
	if err != nil {
		return nil, errors.New(name, err)
	}
	updatedArgs := []string{}
	for _, arg := range args {
		updatedArgs = append(updatedArgs, strings.Replace(arg, "{port}", strconv.Itoa(port), -1))
	}

	cmd, err := NewCmd(name, d, exe, xvfb, env, updatedArgs...)
	if err != nil {
		return nil, err
	}
	return &Server{
		Cmd:           cmd,
		address:       net.JoinHostPort("localhost", strconv.Itoa(port)),
		port:          port,
		healthPattern: healthPattern,
		timeout:       timeout,
	}, nil
}

// Start starts the server, waits for it to become healhy, and monitors it to ensure that it
// stays healthy.
func (s *Server) Start(ctx context.Context) error {
	if err := s.Cmd.Start(ctx); err != nil {
		return err
	}

	healthyCtx, cancel := context.WithTimeout(ctx, s.timeout)
	defer cancel()
	if err := healthreporter.WaitForHealthy(healthyCtx, s); err != nil {
		return errors.New(s.Name(), err)
	}
	return nil
}

// Stop stops the server.
func (s *Server) Stop(ctx context.Context) error {
	if err := s.Cmd.Stop(ctx); err != nil {
		return err
	}
	return portpicker.RecycleUnusedPort(s.port)
}

// Healthy returns nil if the server responds OK to requests to health page.
func (s *Server) Healthy(ctx context.Context) error {
	if err := s.Cmd.Healthy(ctx); err != nil {
		return err
	}
	if s.healthPattern == "" {
		dialer := &net.Dialer{}
		c, err := dialer.DialContext(ctx, "tcp", s.address)
		if err != nil {
			return err
		}

		switch t := c.(type) {
		case *net.TCPConn:
			t.Close()
		}

		return nil
	}
	url := fmt.Sprintf(s.healthPattern, s.address)
	resp, err := httphelper.Get(ctx, url)
	if err != nil {
		return errors.New(s.Name(), fmt.Errorf("error getting %s: %v", url, err))
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return errors.New(s.Name(), fmt.Errorf("request to %s returned status %v", url, resp.StatusCode))
	}
	return nil
}

// Port returns the port this server is running on as a string.
func (s *Server) Port() string {
	return fmt.Sprintf("%d", s.port)
}

// Address returns the address of the server (localhost:%port%).
func (s *Server) Address() string {
	return s.address
}
