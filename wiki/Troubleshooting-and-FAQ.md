# Troubleshooting and Frequently Asked Questions (FAQ)

This guide documents solutions for known installation errors, container environment issues, testing failures, and GitHub branch ruleset constraints encountered when working on **SafaiOS**.

---

## Quick Reference Table

| Category | Common Symptom | Immediate Resolution |
| :--- | :--- | :--- |
| **Docker / WSL** | `npipe:////./pipe/dockerDesktopLinuxEngine` connection error | Enable Virtual Machine Platform in Windows or use Linux/Codespaces |
| **Python** | Huge (>12GB) CUDA download during torch install | Install CPU-only PyTorch wheel with index-url parameter |
| **PowerShell** | `cannot be loaded because running scripts is disabled` | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` |
| **Supabase** | `Port 54322 already in use` | Stop conflicting Docker containers: `docker rm -f $(docker ps -aq)` |
| **Git / PR** | Rejection: `Merge commits are prohibited on main` | Rebase branch against main: `git rebase origin/main` |
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

