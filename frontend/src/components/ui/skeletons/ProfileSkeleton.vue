<template>
  <div class="profile-skeleton">
    <el-skeleton animated>
      <template #template>
        <div class="profile-header-skeleton">
          <el-skeleton-item variant="circle" style="width: 80px; height: 80px;" />
          <div style="margin-left: 16px;">
            <el-skeleton-item variant="h3" style="width: 150px;" />
            <el-skeleton-item variant="text" style="width: 200px; margin-top: 8px;" />
          </div>
        </div>
        <div class="profile-form-skeleton" style="margin-top: 32px;">
          <div class="form-row" v-for="i in 4" :key="i">
            <el-skeleton-item variant="text" style="width: 100px;" />
            <el-skeleton-item variant="p" style="width: 100%; height: 40px; margin-top: 8px;" />
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
          <el-skeleton-item variant="button" style="width: 100px; height: 40px;" />
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.profile-header-skeleton {
  display: flex;
  align-items: center;
}

.profile-form-skeleton {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style> 