package policy

type Action string

const (
	ActionAllow Action = "allow"
	ActionBlock Action = "block"
	ActionWarn  Action = "warn"
)

type Rule struct {
	Name    string `json:"name"`
	Pattern string `json:"pattern"`
	Action  Action `json:"action"`
	Reason  string `json:"reason"`
}

type Policy struct {
	Version int    `json:"version"`
	Rules   []Rule `json:"rules"`
}

type Evaluation struct {
	Allowed    bool     `json:"allowed"`
	RiskLevel  string   `json:"risk_level"`
	Violations []string `json:"violations"`
}
