<template>
  <div class="expense-card-skeleton-container">
    <div v-for="i in count" :key="i" class="expense-card-skeleton">
      <el-skeleton animated>
        <template #template>
          <div class="skeleton-card">
            <div class="skeleton-header">
              <el-skeleton-item variant="circle" style="width: 40px; height: 40px;" />
              <div class="skeleton-title">
                <el-skeleton-item variant="h3" style="width: 50%; height: 20px;" />
                <el-skeleton-item variant="text" style="width: 30%; margin-top: 8px;" />
              </div>
            </div>
            <div class="skeleton-content">
              <el-skeleton-item variant="text" style="width: 100%;" />
              <el-skeleton-item variant="text" style="width: 70%;" />
            </div>
            <div class="skeleton-footer">
              <el-skeleton-item variant="button" style="width: 30%; height: 32px;" />
              <el-skeleton-item variant="button" style="width: 30%; height: 32px;" />
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
    default: 3
  }
});
</script>

<style scoped>
.expense-card-skeleton-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.skeleton-card {
  padding: 16px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.skeleton-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.skeleton-title {
  margin-left: 12px;
  flex: 1;
}

.skeleton-content {
  margin-bottom: 16px;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
}

@media (max-width: 768px) {
  .expense-card-skeleton-container {
    grid-template-columns: 1fr;
  }
}
</style> 