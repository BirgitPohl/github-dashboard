# GitHub Dashboard

A beautiful dashboard for monitoring GitHub workflows, repositories, and projects across your organization.

## ✨ Features

- **🔄 Workflows**: Monitor GitHub Actions workflows across all repositories
- **📁 Repositories**: Browse and categorize all organization repositories
- **📋 Projects**: View GitHub Projects (project boards) with item counts and status
- **🎨 Beautiful UI**: Clean, responsive design with status-based styling
- **🔍 Smart Categorization**: Automatic repository categorization and tech stack detection

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=GithubOwner
```

### 3. GitHub Token Setup

Create a GitHub Personal Access Token with the following scopes:

**Required for Workflows & Repositories:**
- `repo` - Access to repositories
- `read:org` - Read organization data

**Additional for Projects:**
- `read:project` - Access to GitHub Projects (project boards)

**How to create the token:**

1. Go to [GitHub Token Settings](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "GitHub Dashboard")
4. Select the required scopes listed above
5. Click "Generate token"
6. Copy the token and add it to your `.env` file

### 4. Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## 📱 Pages

### Workflows (`/`)
- Shows GitHub Actions workflow runs from all repositories
- Color-coded status indicators (success, failure, pending)
- Repository context and branch information
- Sorted by most recent runs

### Repositories (`/repositories`)
- Lists all organization repositories
- Automatic categorization (Web App, API/Service, Library, etc.)
- Tech stack detection from languages and topics
- Statistics: stars, forks, issues, last updated
- Repository size and creation date

### Projects (`/projects`)
- GitHub Projects (project boards) overview
- Active vs closed project status
- Item counts per project
- Direct links to project boards

**Note:** Projects page requires the `read:project` scope. Without it, you'll see a helpful error message with setup instructions.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | Personal Access Token | ✅ Yes |
| `GITHUB_OWNER` | Organization/User name | ✅ Yes |

### Token Scopes

| Scope | Purpose | Required For |
|-------|---------|--------------|
| `repo` | Repository access | Workflows, Repositories |
| `read:org` | Organization data | All features |
| `read:project` | GitHub Projects | Projects page |

## 🏗️ Production

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 🎨 Architecture

- **Nuxt 3** - Vue.js framework with SSR
- **TypeScript** - Type safety throughout
- **GitHub API** - REST API for workflows/repos, GraphQL for projects
- **Responsive Design** - Mobile-friendly interface
- **Error Handling** - Graceful fallbacks and helpful error messages

## 🔍 API Endpoints

- `/api/workflows` - Fetch workflow runs from all repositories
- `/api/repositories` - Get categorized repository information  
- `/api/projects` - GitHub Projects with GraphQL API

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is for internal use at Oracommit.

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
