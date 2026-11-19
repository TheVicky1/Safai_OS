# Troubleshooting and Frequently Asked Questions (FAQ)

This guide documents solutions for known installation errors, container environment issues, testing failures, and GitHub branch ruleset constraints encountered when working on **SafaiOS**.

---

## Quick Reference Table

| Category | Common Symptom | Immediate Resolution |
| :--- | :--- | :--- |
| **Docker / WSL** | `npipe:////./pipe/dockerDesktopLinuxEngine` connection error | Enable Virtual Machine Platform in Windows or use Linux/Codespaces |
| **Python** | Huge (>12GB) CUDA download during torch install | Install CPU-only PyTorch wheel with index-url parameter |
| **PowerShell** | `cannot be loaded because running scripts is disabled` | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` |
| **Supabase** | `Port 54322 already in use` | Stop conflicting container: `docker stop $(docker ps -q --filter publish=54322)` |
| **Git / PR** | Rejection: `Merge commits are prohibited on main` | Rebase onto upstream main: `git fetch upstream && git rebase upstream/main` |
| **GitHub CI** | Missing check `Quality Gates & Verification (20.x)` | Ensure PR targets `main` and test scripts pass locally |

---

## 1. Docker Desktop and Windows Subsystem for Linux (WSL 2)

### Symptom: `dockerDesktopLinuxEngine` Not Found
```text
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.47/version": 
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

### Root Cause
Docker Desktop on Windows requires a functional Linux backend. On modern Windows installations, this is provided by WSL 2. If the Windows optional feature **Virtual Machine Platform** is disabled in the OS or CPU Virtualization (VT-x / AMD-V) is disabled in the BIOS/UEFI firmware, the Linux engine fails to initialize.

### Step-by-Step Resolution

1. **Verify BIOS Hardware Virtualization**:
   - Open Task Manager (`Ctrl + Shift + Esc`).
   - Click the **Performance** tab -> **CPU**.
   - Confirm that **Virtualization** is listed as **Enabled**.
   - If disabled, reboot into BIOS/UEFI firmware and enable Intel VT-x or AMD SVM.

2. **Enable Virtual Machine Platform Feature** (Requires Administrator):
   Open PowerShell as Administrator and run:
   ```powershell
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   ```
   Reboot your PC to finalize Windows feature installation.

3. **Install or Update WSL Kernel**:
   ```powershell
   wsl --update
   wsl --set-default-version 2
   ```

4. **Verify Docker Desktop Settings**:
   - Open Docker Desktop Settings.
   - Under **General**, check `Use the WSL 2 based engine`.
   - Under **Resources** -> **WSL Integration**, enable integration with your default distro.
   - Click **Apply & Restart**.

5. **Cloud Alternative (Zero Docker Setup)**:
   If you cannot modify your local Windows host or lack administrative permissions, you can develop SafaiOS in:
   - **GitHub Codespaces**: Cloud Linux environment with pre-installed Docker and Python.
   - **WSL 2 Ubuntu terminal**: Directly inside an isolated Ubuntu instance.

---

## 2. Python Environment and Dependencies

### Issue: Script Execution Disabled in PowerShell
```text
File C:\Users\...\activate.ps1 cannot be loaded because running scripts is disabled on this system.
```

**Fix**: Set execution policy for the current shell session only (no admin required):
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

---

### Issue: Slow PyTorch Installation or Massive Download Size
By default, running `pip install torch` on Windows may download CUDA binaries exceeding 2.5 GB compressed (unpacks to 12 GB+). If you are developing locally on a CPU or laptop, install the lightweight CPU build:

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

Then install SafaiOS development dependencies:
```bash
pip install -e ".[dev]"
```

---

### Issue: ModuleNotFoundError for `safai`
If `pytest` or Python scripts report `ModuleNotFoundError: No module named 'safai'`, ensure SafaiOS is installed in editable mode inside your virtual environment:

```bash
pip install -e .
```

Verify the installation:
```bash
python -c "import safai; print(safai.__file__)"
```

---

## 3. Supabase Local Stack and Database

### Issue: `supabase: command not found`
Install the official Supabase CLI:

- **Via npm** (cross-platform):
  ```bash
  npm install -g supabase
  ```
- **Via Scoop** (Windows):
  ```powershell
  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
  scoop install supabase
  ```
- **Via Homebrew** (macOS / Linux):
  ```bash
  brew install supabase/tap/supabase
  ```

---

### Issue: Port Conflicts (e.g. Port 54322 or 54321 Already in Use)
If local PostgreSQL or another container is occupying ports required by Supabase (such as port 54322 for PostgreSQL or 54321 for the API gateway):

1. **Stop existing Supabase instances**:
   ```bash
   supabase stop
   ```

2. **Identify and stop conflicting Docker containers**:
   Substitute the specific conflicting port (e.g. `54322` or `54321`):
   ```bash
   docker ps --filter "publish=<PORT>"
   ```
   Stop only the specific container binding that port (avoid stopping unrelated containers):
   ```bash
   docker stop $(docker ps -q --filter publish=<PORT>)
   ```

3. **Check for host-level services (Host PostgreSQL / system processes)**:
   If Docker reports no containers binding the port, a host service (such as native PostgreSQL or pgAdmin) may be running:
   - On Windows (PowerShell):
     ```powershell
     Get-NetTCPConnection -LocalPort <PORT> -ErrorAction SilentlyContinue | Select-Object OwningProcess
     Get-Process -Id <PID>
     # Stop host PostgreSQL service if appropriate
     Stop-Service postgresql* -ErrorAction SilentlyContinue
     ```
   - On Linux / macOS:
     ```bash
     sudo lsof -i :<PORT>
     sudo systemctl stop postgresql
     ```

4. **Alternative: Adjust the configured Supabase port**:
   If the conflicting host service cannot be terminated, update `supabase/config.toml` to bind an alternate port (for example under `[db]` set `port = 54325`).

5. **Restart Supabase**:
   ```bash
   supabase start
   ```

---

### Issue: Migration Syntax or Constraint Errors
If you modify `supabase/migrations/` and receive a PostgreSQL error during `supabase db reset`:
- Check the terminal output for the exact line number and SQL statement.
- Ensure all custom functions define `set search_path = public, extensions`.
- Confirm all `grant select, insert, update` statements include the target role (e.g. `to authenticated;`).
- Validate table constraints before applying them.

---

## 4. Git and Branch Protection Ruleset (`Protect Main`)

SafaiOS enforces branch protection on `main` to preserve code quality and linear history.

### Error: `Merge commits are prohibited on main`
The ruleset requires linear history. Merge commits created with `git merge` will be rejected by GitHub when pushed.

**Fix**: Rebase your feature branch against the project upstream `main`:
```bash
git checkout feature/my-feature
# Configure upstream remote if not already added
git remote add upstream https://github.com/TheVicky1/Safai_OS.git 2>/dev/null || true
git fetch upstream
git rebase upstream/main
git push --force-with-lease origin feature/my-feature
```

---

### Error: Status Checks Pending or Not Found
The branch ruleset requires two checks to pass:
1. `Quality Gates & Verification (20.x)`
2. `Dependency Health & Vulnerability Scan (20.x)`

If your PR shows checks pending or missing:
- Verify that your PR is opened against the `main` branch.
- Check the **Actions** tab on GitHub to see if a workflow failed.
- Confirm that your branch contains the latest `.github/workflows/` definitions.

---

### Error: Conversation Resolution Required
GitHub blocks merging if there are unresolved comments from code reviews.
- Navigate to the **Files changed** tab on your PR.
- Address each reviewer comment.
- Click **Resolve conversation** for every thread.

---

## 5. Frequently Asked Questions (FAQ)

### Q: Do I need a physical GPU to contribute to SafaiOS?
**A**: No. All 151 unit tests and inference verification routines are designed to run cleanly on CPU. SafaiOS automatically falls back to CPU tensor operations when CUDA or Apple MPS hardware is absent.

### Q: What is the recommended pull request workflow?
1. Fork `TheVicky1/Safai_OS` on GitHub.
2. Clone your fork locally and create a descriptive branch: `git checkout -b fix/issue-title`.
3. Make atomic, well-documented changes.
4. Run tests: `pytest tests/ -v` (151 passing).
5. Run secret scan: `node scripts/secret-scan.mjs`.
6. Push to your fork and submit a PR to `main`.
7. Once approved and checks pass, the maintainers will squash-merge your PR.

### Q: How can I suggest a new waste category or dataset expansion?
Open an issue using the **Dataset Expansion Proposal** template or start a thread in GitHub Discussions under the **Computer Vision & Datasets** category. Provide details on class definition, visual characteristics in urban environments, and potential confusion with existing classes.

### Q: Who can I contact for urgent security vulnerabilities?
Please do not open public issues for security vulnerabilities. Follow the instructions in `SECURITY.md` or contact the core maintainers directly.

