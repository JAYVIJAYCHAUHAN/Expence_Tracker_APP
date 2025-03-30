<template>
  <div class="subscription-skeleton">
    <el-skeleton animated>
      <template #template>
        <div class="subscription-header">
          <el-skeleton-item variant="h3" style="width: 200px;" />
          <el-skeleton-item variant="text" style="width: 60%; margin-top: 8px;" />
        </div>
        <div class="subscription-plans" style="display: flex; gap: 24px; margin-top: 32px;">
          <div class="plan-card" v-for="i in 3" :key="i" style="flex: 1; padding: 16px;">
            <el-skeleton-item variant="h3" style="width: 70%;" />
            <el-skeleton-item variant="h1" style="width: 60%; margin: 16px 0;" />
            <div v-for="j in 4" :key="j" style="display: flex; align-items: center; margin-bottom: 8px;">
              <el-skeleton-item variant="circle" style="width: 16px; height: 16px; margin-right: 8px;" />
              <el-skeleton-item variant="text" style="width: 80%;" />
            </div>
            <el-skeleton-item variant="button" style="width: 100%; height: 40px; margin-top: 16px;" />
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.subscription-header {
  text-align: center;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .subscription-plans {
    flex-direction: column !important;
  }
}
</style> 