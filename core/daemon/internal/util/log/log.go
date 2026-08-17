package log

import (
	"fmt"
	"os"
	"time"
)

func Info(format string, args ...any) {
	msg := fmt.Sprintf(format, args...)
	fmt.Fprintf(os.Stderr, "[INFO] %s %s\n", time.Now().Format("15:04:05"), msg)
}

func Warn(format string, args ...any) {
	msg := fmt.Sprintf(format, args...)
	fmt.Fprintf(os.Stderr, "[WARN] %s %s\n", time.Now().Format("15:04:05"), msg)
}

func Error(format string, args ...any) {
	msg := fmt.Sprintf(format, args...)
	fmt.Fprintf(os.Stderr, "[ERROR] %s %s\n", time.Now().Format("15:04:05"), msg)
}
