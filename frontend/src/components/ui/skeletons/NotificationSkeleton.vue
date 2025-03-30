<template>
  <div class="notification-skeleton">
    <el-skeleton animated :count="count">
      <template #template>
        <div class="notification-item" style="display: flex; padding: 16px 0; border-bottom: 1px solid #eee;">
          <el-skeleton-item variant="circle" style="width: 40px; height: 40px; margin-right: 12px;" />
          <div style="flex: 1;">
            <el-skeleton-item variant="h3" style="width: 60%; height: 20px;" />
            <el-skeleton-item variant="text" style="width: 90%; margin-top: 8px;" />
            <el-skeleton-item variant="text" style="width: 30%; margin-top: 8px;" />
          </div>
        </div>
      </template>
    </el-skeleton>
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
.notification-skeleton {
  width: 100%;
}

.notification-item {
  transition: background-color 0.3s;
}

.notification-item:hover {
  background-color: #f9f9f9;
}
</style> 