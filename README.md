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

Optional — override up to 10 brand colors with a JSON env var. Unset keys keep their defaults.

```env
BRAND_COLORS={"primary":"#0066cc","primaryBright":"#cce0ff","success":"#00aa44"}
```

Allowed keys: `primary`, `primaryBright`, `primaryDark`, `secondary`, `secondaryBright`, `secondaryDark`, `tertiary`, `tertiaryBright`, `tertiaryDark`, `neutral`, `neutralBright`, `neutralDark`, `success`, `successBright`, `successDark`, `warning`, `warningBright`, `warningDark`, `error`, `errorBright`, `errorDark`, `info`, `infoBright`, `infoDark`. Values must be hex (`#abc` or `#aabbcc`).

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
