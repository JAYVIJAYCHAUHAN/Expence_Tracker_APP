<template>
  <div class="expense-list-skeleton">
    <el-skeleton animated :count="count" style="width: 100%;">
      <template #template>
        <div class="list-item-skeleton">
          <div class="skeleton-left">
            <el-skeleton-item variant="circle" style="width: 32px; height: 32px;" />
          </div>
          <div class="skeleton-content">
            <el-skeleton-item variant="h3" style="width: 40%; height: 16px;" />
            <el-skeleton-item variant="text" style="width: 25%; margin-top: 8px;" />
          </div>
          <div class="skeleton-right">
            <el-skeleton-item variant="text" style="width: 60px;" />
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
    default: 5
  }
});
</script>

<style scoped>
.list-item-skeleton {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f2f2f2;
}

.skeleton-left {
  margin-right: 12px;
}

.skeleton-content {
  flex: 1;
}

.skeleton-right {
  margin-left: 12px;
}
</style> 