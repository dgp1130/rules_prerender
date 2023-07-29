/// Copyright 2016 Google Inc.
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

package errors

import (
	"errors"
	"fmt"
	"strings"
	"testing"
)

func TestNewFromString(t *testing.T) {
	fromString := New("fromString", "error")
	if Component(fromString) != "fromString" {
		t.Errorf(`expected Component(fromString) == "fromString", got %s`, Component(fromString))
	}
	if !strings.Contains(fromString.Error(), "error") {
		t.Errorf(`expected fromString.Error() contains "error", got %s`, fromString.Error())
	}

	err := errors.New("error")
	fromError := New("fromError", err)
	if Component(fromError) != "fromError" {
		t.Errorf(`expected Component(fromError) == "fromError", got %s`, Component(fromError))
	}
	if !strings.Contains(fromError.Error(), "error") {
		t.Errorf(`got %v, expected fromError.Error() contains "error"`, fromError.Error())
	}

	if sameComp := New("fromString", fromString); sameComp != fromString {
		t.Errorf("expected sameComp == %+v, got %+v", fromString, sameComp)
	}

	if newComp := New("newComp", fromString); newComp != fromString {
		t.Errorf("expected newComp == %+v, got %+v", fromString, newComp)
	}
}

func TestJoinErrors(t *testing.T) {
	testCases := []struct {
		name  string
		input []error
		want  string
	}{
		{
			name:  "one error",
			input: []error{fmt.Errorf("error1")},
			want:  "error1",
		},
		{
			name:  "two errors",
			input: []error{fmt.Errorf("error1"), fmt.Errorf("error2")},
			want:  "errors:\n\terror1\n\terror2",
		},
		{
			name:  "nil and error",
			input: []error{nil, fmt.Errorf("error1")},
			want:  "error1",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			got := JoinErrs(tc.input...).Error()
			if got != tc.want {
				t.Errorf("got:\n%#v\n\nwant:\n%#v", got, tc.want)
			}
		})
	}
}
