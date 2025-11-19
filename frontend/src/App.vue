<template>
  <Navbar />
  <router-view />
</template>

<script setup>
import Navbar from "./components/Navbar.vue"
</script>

<style>
body {
  margin: 0;
  background: #f5f5f5;
  font-family: sans-serif;
}
</style>
