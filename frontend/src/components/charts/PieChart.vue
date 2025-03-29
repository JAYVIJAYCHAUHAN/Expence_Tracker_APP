<template>
  <div ref="chartContainer" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineExpose } from 'vue';
import * as echarts from 'echarts/core';
import { PieChart as PieChartComponent } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChartComponent,
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

  const colors = [
    '#00c4cc', '#7209b7', '#ff9f43', '#28c76f', '#ea5455',
    '#5a8dee', '#af72eb', '#ff6b6b', '#2dce89', '#ff8f5e'
  ];

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ₹{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: 'Expenses',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['65%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '12',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: props.data.map((item: any, index: number) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: colors[index % colors.length]
          }
        }))
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