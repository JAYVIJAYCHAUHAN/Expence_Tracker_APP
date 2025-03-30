<template>
  <div class="chart-skeleton" :style="{height: height}">
    <el-skeleton animated>
      <template #template>
        <div style="padding: 16px;">
          <el-skeleton-item variant="h3" style="width: 30%;" />
          <div class="chart-area" style="margin-top: 16px;">
            <div class="chart-bars">
              <div class="chart-bar" v-for="i in 7" :key="i">
                <div class="bar" :style="{ height: `${Math.random() * 70 + 10}%` }"></div>
                <el-skeleton-item variant="text" style="width: 30px; margin-top: 8px;" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
defineProps({
  height: {
    type: String, 
    default: '300px'
  }
});
</script>

<style scoped>
.chart-area {
  height: 200px;
  border-radius: 4px;
  position: relative;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 100%;
  padding-bottom: 24px;
}

.chart-bar {
  width: 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar {
  width: 100%;
  background: linear-gradient(to top, rgba(0, 196, 204, 0.3), rgba(114, 9, 183, 0.3));
  border-radius: 4px 4px 0 0;
}
</style> 