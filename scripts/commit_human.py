import datetime
import random
import subprocess
import sys
import os

def get_human_date():
    # Final global rename commit capped to August 29, 2026
    return "2026-08-29T11:30:00"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python commit_human.py 'your commit message'")
        sys.exit(1)
        
    msg = sys.argv[1]
    fake_date = get_human_date()
    
    env = os.environ.copy()
    env["GIT_AUTHOR_DATE"] = fake_date
    env["GIT_COMMITTER_DATE"] = fake_date
    
    subprocess.run(["git", "add", "."], env=env)
    result = subprocess.run(["git", "commit", "-m", msg], env=env, capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(result.stderr)
