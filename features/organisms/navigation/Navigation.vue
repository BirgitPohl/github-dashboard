<template>
  <nav class="navigation">
    <div class="nav-content">
      <Header :level="1" size="2xl" variant="primary" class="nav-title">
        GitHub Dashboard
      </Header>
      <div class="nav-links">
        <NuxtLink to="/" class="nav-link">
          <Text variant="secondary" size="base" weight="medium">Workflows</Text>
        </NuxtLink>
        <NuxtLink to="/repositories" class="nav-link">
          <Text variant="secondary" size="base" weight="medium">Repositories</Text>
        </NuxtLink>
        <NuxtLink to="/pull-requests" class="nav-link">
          <Text variant="secondary" size="base" weight="medium">Pull Requests</Text>
        </NuxtLink>
        <NuxtLink to="/projects" class="nav-link">
          <Text variant="secondary" size="base" weight="medium">Project Boards</Text>
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Layout structure only - typography and colors handled by atoms */
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
  margin: 0;
}

.nav-links {
  display: flex;
  gap: var(--spacing-6);
}

.nav-link {
  text-decoration: none;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.nav-link:hover {
  background: var(--color-gray-100);
}

.nav-link.router-link-active {
  background: var(--color-primary-100);
}

.nav-link.router-link-active :deep(span) {
  color: var(--color-primary-700);
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
