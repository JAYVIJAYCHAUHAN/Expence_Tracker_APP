<template>
  <div class="settings-skeleton">
    <el-skeleton animated>
      <template #template>
        <div class="settings-tabs-skeleton">
          <div class="tabs-header">
            <el-skeleton-item v-for="i in 4" :key="i" variant="text" style="width: 100px; height: 32px; margin-right: 16px;" />
          </div>
          <div class="tab-content" style="margin-top: 24px;">
            <el-skeleton-item variant="h3" style="width: 30%;" />
            <div style="margin-top: 16px;">
              <div class="setting-item" v-for="i in 5" :key="i" style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <el-skeleton-item variant="text" style="width: 150px;" />
                    <el-skeleton-item variant="text" style="width: 250px; margin-top: 8px;" />
                  </div>
                  <el-skeleton-item variant="button" style="width: 50px; height: 30px;" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.settings-tabs-skeleton {
  padding: 16px;
}

.tabs-header {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
}

.tab-content {
  padding-top: 16px;
}
</style>