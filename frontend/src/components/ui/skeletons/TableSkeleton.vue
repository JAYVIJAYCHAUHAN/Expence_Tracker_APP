<template>
  <div class="table-skeleton">
    <el-skeleton animated>
      <template #template>
        <div class="table-header" style="display: flex; border-bottom: 1px solid #eee; padding-bottom: 12px;">
          <div v-for="i in columns" :key="`header-${i}`" style="flex: 1; padding: 8px;">
            <el-skeleton-item variant="text" style="width: 60%;" />
          </div>
        </div>
        <div v-for="i in rows" :key="`row-${i}`" class="table-row" style="display: flex; border-bottom: 1px solid #eee;">
          <div v-for="j in columns" :key="`cell-${i}-${j}`" style="flex: 1; padding: 16px 8px;">
            <el-skeleton-item variant="text" style="width: 70%;" />
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
defineProps({
  rows: {
    type: Number,
    default: 5
  },
  columns: {
    type: Number,
    default: 4
  }
});
</script>

<style scoped>
.table-skeleton {
  width: 100%;
  overflow-x: auto;
}

.table-row:nth-child(even) {
  background-color: #fafafa;
}
</style> 