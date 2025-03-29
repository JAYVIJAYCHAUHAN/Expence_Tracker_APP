<template>
  <div ref="chartContainer" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineExpose } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart as LineChartComponent } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChartComponent,
  CanvasRenderer
]);

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
});

const chartContainer = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;

const initChart = () => {
  if (!chartContainer.value) return;
  
  chart = echarts.init(chartContainer.value);
  updateChart();

  window.addEventListener('resize', () => {
    chart?.resize();
  });
};

const updateChart = () => {
  if (!chart) return;

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        const date = params[0].name;
        const value = params[0].value;
        return `${date}<br/>Amount: ₹${value.toLocaleString('en-IN')}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.data.map((item: any) => item.date)
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `₹${value.toLocaleString('en-IN')}`
      }
    },
    series: [
      {
        name: 'Expenses',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#00c4cc'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(0, 196, 204, 0.5)'
            },
            {
              offset: 1,
              color: 'rgba(0, 196, 204, 0.1)'
            }
          ])
        },
        data: props.data.map((item: any) => item.amount)
      }
    ]
  };

  chart.setOption(option);
};

// Get chart as base64 image
const getChartImage = () => {
  if (!chart) return '';
  return chart.getDataURL({
    pixelRatio: 2,
    backgroundColor: '#fff'
  });
};

// Re-render chart when data changes
watch(() => props.data, () => {
  updateChart();
}, { deep: true });

// Initialize chart on component mount
onMounted(() => {
  initChart();
});

// Expose methods to parent component
defineExpose({
  getChartImage
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style> 