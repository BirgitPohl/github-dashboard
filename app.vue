<template>
  <div class="app">
    <nav class="navigation">
      <div class="nav-content">
        <h1 class="nav-title">GitHub Dashboard</h1>
        <div class="nav-links">
          <NuxtLink to="/" class="nav-link">Workflows</NuxtLink>
          <NuxtLink to="/repositories" class="nav-link">Repositories</NuxtLink>
          <NuxtLink to="/pull-requests" class="nav-link">Pull Requests</NuxtLink>
          <NuxtLink to="/projects" class="nav-link">Project Boards</NuxtLink>
        </div>
      </div>
    </nav>
    
    <main class="main-content">
      <NuxtPage />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #f9fafb;
}

.navigation {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-link {
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: #111827;
  background: #f3f4f6;
}

.nav-link.router-link-active {
  color: #1d4ed8;
  background: #dbeafe;
}

.main-content {
  padding: 0;
}

@media (max-width: 768px) {
  .nav-content {
    padding: 0 16px;
    flex-direction: column;
    gap: 12px;
  }
  
  .nav-links {
    gap: 16px;
  }
}
</style>