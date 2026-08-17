package errors

import "fmt"

type BarError struct {
	Code    string
	Message string
	Err     error
}

func (e *BarError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("[%s] %s: %v", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

func New(code, message string) *BarError {
	return &BarError{Code: code, Message: message}
}

func Wrap(err error, code, message string) *BarError {
	return &BarError{Code: code, Message: message, Err: err}
}
