import datetime
import random
import subprocess
import sys
import os

def get_human_date():
    today = datetime.datetime.now()
    valid_days = []
    # Look back 120 days
    for i in range(1, 121):
        day = today - datetime.timedelta(days=i)
        if day.weekday() < 5: # Monday to Friday
            if random.random() > 0.15: # Skip 15% of weekdays randomly
                valid_days.append(day)
                
    if not valid_days:
        valid_days.append(today)
        
    chosen_day = random.choice(valid_days)
    hour = random.randint(8, 18)
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    
    fake_date = chosen_day.replace(hour=hour, minute=minute, second=second)
    return fake_date.strftime("%Y-%m-%dT%H:%M:%S")

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
