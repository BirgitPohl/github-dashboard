# GitHub Dashboard

Dashboard for monitoring GitHub Actions workflows, repositories, and pull requests across an organization.

## Setup

```bash
npm install
```

Create a `.env` in the project root:

```env
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=YourGithubOrgOrUser
```

The token needs the `repo` and `read:org` scopes — create one at <https://github.com/settings/tokens>.

## Run

```bash
npm run dev       # http://localhost:3000
npm run build     # production build
npm run preview   # preview production build
```

## Pages

| Route             | Description                                  |
| ----------------- | -------------------------------------------- |
| `/`               | Workflow runs across all repos               |
| `/repositories`   | Categorized repositories with tech stacks    |
| `/pull-requests`  | PRs filtered by state, repo, or search       |
