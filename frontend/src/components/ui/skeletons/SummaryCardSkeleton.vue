<template>
  <div class="summary-card-skeleton-container">
    <div v-for="i in count" :key="i" class="summary-card-skeleton">
      <el-skeleton animated>
        <template #template>
          <div class="skeleton-summary-card">
            <el-skeleton-item variant="h3" style="width: 50%;" />
            <el-skeleton-item variant="h1" style="width: 70%; margin: 16px 0;" />
            <el-skeleton-item variant="text" style="width: 40%;" />
          </div>
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  count: {
    type: Number,
    default: 4
  }
});
</script>

<style scoped>
.summary-card-skeleton-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.skeleton-summary-card {
  padding: 16px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .summary-card-skeleton-container {
    grid-template-columns: 1fr;
  }
}
</style> 