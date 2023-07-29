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

// Package errors provides an Error interface that includes the component name with the underlying error.
package errors

import (
	"errors"
	"fmt"
)

// DefaultComp is the default component name used when no other component specified.
const DefaultComp = "web test launcher"

type wtlError struct {
	error
	component string
	permanent bool
}

func (we *wtlError) Component() string {
	return we.component
}

func (we *wtlError) Permanent() bool {
	return we.permanent
}

// Component returns err.Component() if err implements it, otherwise it returns DefaultComp.
// Component is intended for grouping error messages by source.
func Component(err error) string {
	type componentError interface {
		Component() string
	}
	if ce, ok := err.(componentError); ok {
		return ce.Component()
	}
	return DefaultComp
}

// IsPermanent returns err.Permanent() if err implements it, otherwise it returns false.
// IsPermanent is intended for preventing retries when errors occur that are unlikely to go away.
func IsPermanent(err error) bool {
	type permanentError interface {
		Permanent() bool
	}

	pe, ok := err.(permanentError)
	return ok && pe.Permanent()
}

func (we *wtlError) Error() string {
	p := ""
	if we.permanent {
		p = " (permanent)"
	}
	return fmt.Sprintf("[%s%s]: %v", we.component, p, we.error)
}

type multiErr []error

func (me multiErr) Component() string {
	for _, v := range me {
		if c := Component(v); c != DefaultComp {
			return c
		}
	}
	return DefaultComp
}

func (me multiErr) Permanent() bool {
	for _, v := range me {
		if IsPermanent(v) {
			return true
		}
	}
	return false
}

func (me multiErr) Error() string {
	if len(me) == 0 {
		return ""
	}

	msg := "errors:"
	for _, err := range me {
		msg = msg + "\n\t" + err.Error()
	}
	return msg
}

func (me multiErr) String() string {
	return me.Error()
}

// JoinErrs joins multiple errors together into an error.
func JoinErrs(errs ...error) error {
	var joined multiErr

	for _, err := range errs {
		if err == nil {
			continue
		}
		if me, ok := err.(multiErr); ok {
			joined = append(joined, me...)
		} else {
			joined = append(joined, err)
		}
	}

	if len(joined) == 0 {
		return nil
	}
	if len(joined) == 1 {
		return joined[0]
	}

	return joined
}

// New returns an error, e, such that:
//   Permanent(e) is false
//   If Component(err) is not DefaultComp, Component(e) is Component(err)
//   Else If component is "", Component(e) is DefaultComp
//   Else Component(e) is component.
func New(component string, err interface{}) error {
	return createErr(component, err, false)
}

// NewPermanent returns an error, e, such that:
//   Permanent(e) is true
//   If Component(err) is not DefaultComp, Component(e) is Component(err)
//   Else If component is "", Component(e) is DefaultComp
//   Else Component(e) is component.
func NewPermanent(component string, err interface{}) error {
	return createErr(component, err, true)
}

func createErr(component string, err interface{}, permanent bool) error {
	e := func() error {
		switch t := err.(type) {
		case error:
			return t
		case string:
			return errors.New(t)
		default:
			return fmt.Errorf("%v", err)
		}
	}()

	ec := Component(e)
	ep := IsPermanent(e)

	if ec != DefaultComp {
		component = ec
	}

	if component == "" {
		component = DefaultComp
	}

	if ep == permanent && ec == component {
		return e
	}

	if we, ok := e.(*wtlError); ok {
		return createErr(component, we.error, permanent)
	}

	return &wtlError{
		error:     e,
		component: component,
		permanent: permanent,
	}
}
