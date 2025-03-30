<template>
  <div class="savings-goal-skeleton-container">
    <div v-for="i in count" :key="i" class="savings-goal-skeleton">
      <el-skeleton animated>
        <template #template>
          <div class="skeleton-goal-card">
            <div class="skeleton-header">
              <el-skeleton-item variant="circle" style="width: 48px; height: 48px;" />
              <div style="margin-left: 16px; flex: 1;">
                <el-skeleton-item variant="h3" style="width: 60%;" />
                <el-skeleton-item variant="text" style="width: 40%; margin-top: 8px;" />
              </div>
            </div>
            <div style="margin: 16px 0;">
              <el-skeleton-item variant="h1" style="width: 40%; height: 30px;" />
              <el-skeleton-item variant="p" style="width: 100%; height: 20px; margin-top: 8px;" />
            </div>
            <div class="skeleton-details" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 16px;">
              <div v-for="j in 3" :key="j">
                <el-skeleton-item variant="text" style="width: 50%;" />
                <el-skeleton-item variant="text" style="width: 80%; margin-top: 8px;" />
              </div>
            </div>
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
    default: 2
  }
});
</script>

<style scoped>
.savings-goal-skeleton-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.skeleton-goal-card {
  padding: 16px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.skeleton-header {
  display: flex;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .savings-goal-skeleton-container {
    grid-template-columns: 1fr;
  }
}
</style> 