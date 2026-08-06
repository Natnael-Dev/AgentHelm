package policy

import (
	"regexp"
	"strings"
)

type Engine struct {
	policy   *Policy
	compiled map[string]*regexp.Regexp
}

func NewEngine(pol *Policy) (*Engine, error) {
	if pol == nil {
		pol = DefaultPolicy()
	}
	compiled := make(map[string]*regexp.Regexp)
	for _, rule := range pol.Rules {
		re, err := regexp.Compile(rule.Pattern)
		if err != nil {
			return nil, err
		}
		compiled[rule.Name] = re
	}
	return &Engine{
		policy:   pol,
		compiled: compiled,
	}, nil
}

func (e *Engine) Evaluate(cmd string) Evaluation {
	trimmed := strings.TrimSpace(cmd)
	violations := []string{}
	blocked := false

	for _, rule := range e.policy.Rules {
		if re, ok := e.compiled[rule.Name]; ok {
			if re.MatchString(trimmed) {
				violations = append(violations, rule.Name+": "+rule.Reason)
				if rule.Action == ActionBlock {
					blocked = true
				}
			}
		}
	}

	riskLevel := "LOW"
	if blocked {
		riskLevel = "CRITICAL"
	} else if len(violations) > 0 {
		riskLevel = "HIGH"
	}

	return Evaluation{
		Allowed:    !blocked,
		RiskLevel:  riskLevel,
		Violations: violations,
	}
}
