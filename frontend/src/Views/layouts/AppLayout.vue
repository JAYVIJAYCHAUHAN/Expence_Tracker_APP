<template>
  <div class="app-layout">
    <Navbar />
    <main class="main-content">
      <router-view></router-view>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Navbar from './components/Navbar/index.vue';
import Footer from './components/Footer/index.vue';
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 80px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
}

@media only screen and (max-width: 640px) {
  .main-content {
    padding-top: 70px;
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
