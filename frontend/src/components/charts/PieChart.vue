<template>
  <div class="pie-chart">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps<{
  data: { name: string; value: number }[];
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const colors = [
  '#00c4cc',
  '#7209b7',
  '#ff9f43',
  '#ea5455',
  '#28c76f',
  '#336ad7'
];

const createChart = () => {
  if (!chartCanvas.value) return;

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: props.data.map(item => item.name),
      datasets: [{
        data: props.data.map(item => item.value),
        backgroundColor: colors,
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#333',
          bodyColor: '#666',
          bodyFont: {
            size: 14
          },
          padding: 12,
          borderColor: '#eee',
          borderWidth: 1,
          displayColors: false,
          callbacks: {
            label: (context) => {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value * 100) / total).toFixed(1);
              return `₹${value.toLocaleString('en-IN')} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
};

const updateChart = () => {
  if (!chart) return;

  chart.data.labels = props.data.map(item => item.name);
  chart.data.datasets[0].data = props.data.map(item => item.value);
  chart.update();
};

watch(() => props.data, () => {
  updateChart();
}, { deep: true });

onMounted(() => {
  createChart();
});
</script>

<style scoped>
.pie-chart {
  width: 100%;
  height: 100%;
}
</style> 