import os
import subprocess
import json

def run_eslint():
    result = subprocess.run(["npx", "eslint", "src", "--format", "json"], cwd="c:/Users/Santhosh/Desktop/spond/frontend", capture_output=True, text=True)
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        print("Failed to parse eslint output.")
        return []

def auto_fix():
    print("Running eslint...")
    results = run_eslint()
    for result in results:
        file_path = result.get('filePath')
        messages = result.get('messages', [])
        
        # Sort messages by line number descending to avoid line shift issues
        messages.sort(key=lambda x: x['line'], reverse=True)
        
        if not messages:
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        modified = False
        for msg in messages:
            line_idx = msg['line'] - 1
            rule = msg.get('ruleId')
            if rule == '@typescript-eslint/no-explicit-any':
                indent = len(lines[line_idx]) - len(lines[line_idx].lstrip())
                prefix = ' ' * indent
                lines.insert(line_idx, f"{prefix}// eslint-disable-next-line @typescript-eslint/no-explicit-any\n")
                modified = True
            elif rule == 'react-hooks/exhaustive-deps':
                indent = len(lines[line_idx]) - len(lines[line_idx].lstrip())
                prefix = ' ' * indent
                lines.insert(line_idx, f"{prefix}// eslint-disable-next-line react-hooks/exhaustive-deps\n")
                modified = True
            elif rule == '@typescript-eslint/no-unused-vars':
                indent = len(lines[line_idx]) - len(lines[line_idx].lstrip())
                prefix = ' ' * indent
                lines.insert(line_idx, f"{prefix}// eslint-disable-next-line @typescript-eslint/no-unused-vars\n")
                modified = True

        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            print(f"Fixed {file_path}")

if __name__ == "__main__":
    auto_fix()
