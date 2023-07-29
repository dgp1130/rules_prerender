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

// Package environment provides an interface for defining how browser environments
// are managed.
package environment

import (
	"context"
	"sync"

	"github.com/bazelbuild/rules_webtesting/go/errors"
	"github.com/bazelbuild/rules_webtesting/go/healthreporter"
	"github.com/bazelbuild/rules_webtesting/go/metadata"
	"github.com/bazelbuild/rules_webtesting/go/metadata/capabilities"
	"github.com/bazelbuild/rules_webtesting/go/wtl/diagnostics"
)

// Env allows web_test environments to be started for controlling a browser
// using Selenium WebDriver.
type Env interface {
	healthreporter.HealthReporter
	// SetUp is called once at the beginning of the test run, and should start a
	// WebDriver server. It is not necessary that the environment be healthy when
	// this returns.
	SetUp(ctx context.Context) error
	// StartSession is called for each new WebDriver session, before the new
	// session command is sent to the WebDriver server. caps is the capabilities
	// sent to the proxy from the client, and the return value is the capabilities
	// that should be actually sent to the WebDriver server new session command.
	StartSession(ctx context.Context, id int, caps *capabilities.Capabilities) (*capabilities.Capabilities, error)
	// StopSession is called for each new WebDriver session, before the delete
	// session command is sent to the WebDriver server.
	StopSession(ctx context.Context, id int) error
	// TearDown is called at the end of the test run.
	TearDown(ctx context.Context) error
	// WDAddress returns the address of the WebDriver server.
	WDAddress(context.Context) string
}

// Base is a partial implementation of Env useful as the base struct for
// implementations of Env.
type Base struct {
	*metadata.Metadata
	diagnostics.Diagnostics
	name string

	mu      sync.RWMutex
	started bool
	stopped bool
}

// NewBase creates a new Base environment with the given component name.
func NewBase(name string, m *metadata.Metadata, d diagnostics.Diagnostics) (*Base, error) {
	return &Base{
		name:        name,
		Metadata:    m,
		Diagnostics: d,
	}, nil
}

// SetUp starts the Environment.
func (b *Base) SetUp(ctx context.Context) error {
	b.mu.Lock()
	defer b.mu.Unlock()
	if b.started {
		return errors.NewPermanent(b.Name(), "cannot be started; it has already been started once")
	}
	b.started = true
	return nil
}

// StartSession merges the passed in caps with b.Metadata.Capabilities and returns the merged
// capabilities that should be used when calling new session on the WebDriver
// server.
func (b *Base) StartSession(ctx context.Context, id int, caps *capabilities.Capabilities) (*capabilities.Capabilities, error) {
	if err := b.Healthy(ctx); err != nil {
		return nil, err
	}
	return caps.MergeOver(b.Metadata.Capabilities).Resolve(b.Metadata.Resolver())
}

// StopSession is a no-op implementation of Env.StopSession.
func (b *Base) StopSession(ctx context.Context, _ int) error {
	return b.Healthy(ctx)
}

// TearDown is a no-op implementation of Env.TearDown.
func (b *Base) TearDown(ctx context.Context) error {
	b.mu.Lock()
	defer b.mu.Unlock()
	if !b.started {
		return errors.NewPermanent(b.Name(), "cannot be stopped; it was never started")
	}
	if b.stopped {
		return errors.NewPermanent(b.Name(), "cannot be stopped; it was already stopped once")
	}
	b.stopped = true
	return nil
}

// Healthy returns nil (i.e., healthy) iff the environment has been started and
// has not yet been stopped.
func (b *Base) Healthy(context.Context) error {
	b.mu.RLock()
	defer b.mu.RUnlock()
	if !b.started {
		return errors.New(b.Name(), "has not been started")
	}
	if b.stopped {
		return errors.NewPermanent(b.Name(), "has been stopped")
	}
	return nil
}

// WDAddress returns the empty string.
func (*Base) WDAddress(context.Context) string {
	return ""
}

// Name returns the name of this environment to be used in error messages.
func (b *Base) Name() string {
	return b.name
}
