<template>
  <Navbar />
  <router-view />
</template>

<script setup>
import Navbar from "./components/Navbar.vue"
</script>

<style>
/* ========================================
   SEENFLIX DESIGN SYSTEM
   ======================================== */

:root {
  /* Couleurs principales */
  --color-primary: #884da7;
  --color-primary-light: #cbb6ee;
  --color-primary-lighter: #eee6f9;
  --color-white: #ffffff;

  /* Couleurs dérivées */
  --color-primary-dark: #6d3d85;
  --color-text: #2c2c2c;
  --color-text-light: #666666;
  --color-text-lighter: #999999;

  /* Couleurs d'état */
  --color-success: #4caf50;
  --color-success-light: #81c784;
  --color-error: #e63946;
  --color-error-light: #ff6b7a;

  /* Arrière-plans */
  --bg-primary: #fafafa;
  --bg-card: #ffffff;

  /* Ombres */
  --shadow-sm: 0 2px 8px rgba(136, 77, 167, 0.08);
  --shadow-md: 0 4px 16px rgba(136, 77, 167, 0.12);
  --shadow-lg: 0 8px 24px rgba(136, 77, 167, 0.16);
  --shadow-hover: 0 6px 20px rgba(136, 77, 167, 0.2);

  /* Bordures */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 999px;

  /* Espacements */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-xxl: 3rem;

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;

  /* Typographie */
  --font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;

  /* Layout */
  --container-max-width: 1000px;
  --navbar-height: 64px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg-primary);
  font-family: var(--font-family);
  color: var(--color-text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Titres globaux */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-text);
}

h1 {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-lg);
}

h2 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-md);
}

/* Liens */
a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-primary-dark);
}

/* Boutons globaux */
button, .btn {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  font-weight: 500;
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

button:disabled, .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Bouton primaire */
.btn-primary, button[type="submit"] {
  background: var(--color-primary);
  color: var(--color-white);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover:not(:disabled), button[type="submit"]:hover:not(:disabled) {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* Bouton secondaire */
.btn-secondary {
  background: var(--color-primary-lighter);
  color: var(--color-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-primary-light);
  transform: translateY(-1px);
}

/* Bouton outline */
.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary-light);
}

.btn-outline:hover:not(:disabled) {
  background: var(--color-primary-lighter);
  border-color: var(--color-primary);
}

/* Inputs globaux */
input, textarea, select {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--color-primary-light);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--color-text);
  transition: all var(--transition-fast);
  width: 100%;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(136, 77, 167, 0.1);
}

input::placeholder {
  color: var(--color-text-lighter);
}

/* Labels */
label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

/* Cards */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  transition: all var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

/* Messages d'erreur et succès */
.error {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(230, 57, 70, 0.1);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-error);
}

.success {
  color: var(--color-success);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(76, 175, 80, 0.1);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-success);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn var(--transition-base) ease-out;
}

.fade-out {
  animation: fadeOut var(--transition-base) ease-out forwards;
}

/* Scrollbar custom */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: var(--color-primary-lighter);
}

::-webkit-scrollbar-thumb {
  background: var(--color-primary-light);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}
</style>
