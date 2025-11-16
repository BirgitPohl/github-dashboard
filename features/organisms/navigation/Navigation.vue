<template>
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
</template>

<style scoped>
.navigation {
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border-default);
  padding: var(--spacing-4) 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.nav-content {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-8);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.nav-links {
  display: flex;
  gap: var(--spacing-6);
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.nav-link:hover {
  color: var(--color-text-primary);
  background: var(--color-gray-100);
}

.nav-link.router-link-active {
  color: var(--color-primary-700);
  background: var(--color-primary-100);
}

@media (max-width: 768px) {
  .nav-content {
    padding: 0 var(--spacing-4);
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .nav-links {
    gap: var(--spacing-4);
  }
}
</style>
