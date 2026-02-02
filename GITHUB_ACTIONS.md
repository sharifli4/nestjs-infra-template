# GitHub Actions CI/CD

This template includes a comprehensive GitHub Actions setup for continuous integration and continuous deployment.

## 📋 Table of Contents

- [Workflows Overview](#workflows-overview)
- [CI Pipeline](#ci-pipeline)
- [Automated Releases](#automated-releases)
- [Security Scanning](#security-scanning)
- [Docker Builds](#docker-builds)
- [Dependency Management](#dependency-management)
- [Setup Instructions](#setup-instructions)
- [Badges](#badges)

---

## Workflows Overview

| Workflow                | Trigger            | Purpose                          |
| ----------------------- | ------------------ | -------------------------------- |
| `ci.yml`                | Push, PR           | Lint, test, build validation     |
| `release.yml`           | Push to main       | Automatic versioning & changelog |
| `codeql.yml`            | Push, PR, Schedule | Security analysis                |
| `dependency-review.yml` | PR                 | Dependency vulnerability check   |
| `docker.yml`            | Push, PR, Tags     | Docker image builds              |

---

## CI Pipeline

**File:** `.github/workflows/ci.yml`

### Jobs

#### 1. Lint

- Runs ESLint on TypeScript files
- Validates code formatting with Prettier
- Fails if any linting errors are found

#### 2. Test

- Matrix testing on Node.js 18 and 20
- Runs unit tests with coverage
- Runs E2E tests
- Uploads coverage to Codecov (Node 18 only)

#### 3. Build

- Validates that the project builds successfully
- Uploads build artifacts (retained for 7 days)

#### 4. Validate Commits (PRs only)

- Checks all commits in PR for Conventional Commits format
- Fails PR if any commit doesn't follow the standard

### Triggers

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

---

## Automated Releases

**File:** `.github/workflows/release.yml`

### How It Works

1. **Trigger:** Runs on every push to `main` (except release commits)
2. **Check Commits:** Analyzes commits since last tag
3. **Version Bump:** Determines version based on commit types:
   - `feat:` → minor version (1.0.0 → 1.1.0)
   - `fix:` → patch version (1.0.0 → 1.0.1)
   - `BREAKING CHANGE:` → major version (1.0.0 → 2.0.0)
4. **Generate:** Updates `CHANGELOG.md` and `package.json`
5. **Publish:** Creates git tag and GitHub release

### Prerequisites

- All commits must follow [Conventional Commits](https://www.conventionalcommits.org/)
- The workflow needs `contents: write` permission (already configured)

### Permissions Required

```yaml
permissions:
  contents: write
  pull-requests: write
```

### Skip Release

To prevent a release on a specific merge:

```bash
git commit -m "chore: update dependencies [skip ci]"
```

---

## Security Scanning

### CodeQL Analysis

**File:** `.github/workflows/codeql.yml`

- Runs on every push and PR
- Weekly scheduled scans (Mondays at 00:00 UTC)
- Analyzes JavaScript/TypeScript code for security vulnerabilities
- Results appear in the "Security" tab

### Dependency Review

**File:** `.github/workflows/dependency-review.yml`

- Runs on all PRs
- Fails if dependencies have moderate or higher severity vulnerabilities
- Blocks GPL-2.0 and GPL-3.0 licensed dependencies
- Posts summary comment in PR

---

## Docker Builds

**File:** `.github/workflows/docker.yml`

### Features

- Multi-stage Docker builds for optimized images
- Automatic push to GitHub Container Registry (ghcr.io)
- Smart tagging:
  - Branch names (`main`, `develop`)
  - Semantic versions (`v1.2.3`, `v1.2`, `v1`)
  - Git SHA (`sha-abc1234`)
  - PR numbers (`pr-123`)

### Image Tags

```bash
# For v1.2.3 tag:
ghcr.io/your-org/your-repo:1.2.3
ghcr.io/your-org/your-repo:1.2
ghcr.io/your-org/your-repo:1
ghcr.io/your-org/your-repo:latest

# For main branch:
ghcr.io/your-org/your-repo:main
ghcr.io/your-org/your-repo:sha-abc1234
```

### Pull Image

```bash
docker pull ghcr.io/your-org/your-repo:latest
```

---

## Dependency Management

### Dependabot

**File:** `.github/dependabot.yml`

Automatically creates PRs for:

- npm dependencies (weekly, Mondays at 09:00)
- GitHub Actions versions (weekly)
- Docker base images (weekly)

### Configuration

- Max 10 open PRs at a time
- Uses conventional commit format (`chore(deps):`)
- Labels: `dependencies`, `npm`/`github-actions`/`docker`

### Customize

Edit `.github/dependabot.yml`:

```yaml
schedule:
  interval: 'daily' # Change from weekly to daily
```

---

## Setup Instructions

### 1. Enable GitHub Actions

GitHub Actions are enabled by default for public repos. For private repos:

1. Go to **Settings** → **Actions** → **General**
2. Select **Allow all actions and reusable workflows**

### 2. Configure Secrets (Optional)

For Codecov integration:

1. Sign up at [codecov.io](https://codecov.io)
2. Add repository token to GitHub Secrets:
   - Go to **Settings** → **Secrets** → **Actions**
   - Add `CODECOV_TOKEN`

### 3. Enable GitHub Packages

For Docker image publishing:

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select:
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests

### 4. Customize Dependabot

Edit `.github/dependabot.yml`:

```yaml
reviewers:
  - 'your-github-username' # Replace with your username
```

### 5. Update Issue Config

Edit `.github/ISSUE_TEMPLATE/config.yml`:

```yaml
contact_links:
  - name: 💬 Discussions
    url: https://github.com/your-org/your-repo/discussions # Update URL
```

---

## Badges

Add these badges to your README:

```markdown
[![CI](https://github.com/your-org/your-repo/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/your-repo/actions/workflows/ci.yml)
[![Release](https://github.com/your-org/your-repo/actions/workflows/release.yml/badge.svg)](https://github.com/your-org/your-repo/actions/workflows/release.yml)
[![CodeQL](https://github.com/your-org/your-repo/actions/workflows/codeql.yml/badge.svg)](https://github.com/your-org/your-repo/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/your-org/your-repo/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/your-repo)
```

---

## Troubleshooting

### Release Workflow Not Running

**Problem:** Release workflow skipped

**Solution:** Ensure you have feat/fix/perf commits since last tag

```bash
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

### Docker Push Failed

**Problem:** `denied: permission_denied`

**Solution:**

1. Check workflow permissions (Settings → Actions → General)
2. Enable "Read and write permissions"

### CodeQL Analysis Failed

**Problem:** CodeQL can't build project

**Solution:** Add build steps to `.github/workflows/codeql.yml`:

```yaml
- name: Install dependencies
  run: npm ci
```

### Dependabot PRs Not Appearing

**Problem:** No automated dependency PRs

**Solution:**

1. Check `.github/dependabot.yml` exists
2. Verify reviewers exist in repo
3. Check Dependabot logs: Settings → Security → Dependabot

---

## Advanced Configuration

### Add Deployment

Add to `.github/workflows/release.yml`:

```yaml
- name: Deploy to Production
  if: steps.check_commits.outputs.has_changes == 'true'
  run: |
    # Your deployment script
    npm run deploy:prod
  env:
    DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

### Add Slack Notifications

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment completed!'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

### Custom Test Coverage Threshold

Edit `package.json`:

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Docker GitHub Actions](https://github.com/docker/build-push-action)
