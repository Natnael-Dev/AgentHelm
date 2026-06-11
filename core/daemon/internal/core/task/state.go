package task

type State struct {
	ActiveTaskID string           `json:"active_task_id,omitempty"`
	Tasks        map[string]*Task `json:"tasks"`
}
