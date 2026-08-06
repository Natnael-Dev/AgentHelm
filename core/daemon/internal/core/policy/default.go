package policy

func DefaultPolicy() *Policy {
	return &Policy{
		Version: 1,
		Rules: []Rule{
			{
				Name:    "no-rm-rf-root",
				Pattern: `rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)\s+/\s*$`,
				Action:  ActionBlock,
				Reason:  "Dangerous: recursive delete from root directory",
			},
			{
				Name:    "no-rm-rf-home",
				Pattern: `rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)\s+~/?\s*$`,
				Action:  ActionBlock,
				Reason:  "Dangerous: recursive delete home directory",
			},
			{
				Name:    "no-disk-raw-write",
				Pattern: `>\s*/dev/sd[a-z]`,
				Action:  ActionBlock,
				Reason:  "Dangerous: write directly to disk block device",
			},
			{
				Name:    "no-mkfs",
				Pattern: `\bmkfs(\.[a-z0-9]+)?\s+`,
				Action:  ActionBlock,
				Reason:  "Dangerous: format filesystem",
			},
			{
				Name:    "no-dd-raw-device",
				Pattern: `\bdd\s+.*of=/dev/(sd[a-z]|nvme[0-9]|hd[a-z])`,
				Action:  ActionBlock,
				Reason:  "Dangerous: raw disk write via dd",
			},
			{
				Name:    "no-fork-bomb",
				Pattern: `:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:`,
				Action:  ActionBlock,
				Reason:  "Dangerous: bash fork bomb detected",
			},
		},
	}
}
