<template>
  <div class="line-chart">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps<{
  data: { date: string; amount: number }[];
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const createChart = () => {
  if (!chartCanvas.value) return;

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(0, 196, 204, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 196, 204, 0)');

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: props.data.map(item => item.date),
      datasets: [{
        label: 'Expenses',
        data: props.data.map(item => item.amount),
        borderColor: '#00c4cc',
        backgroundColor: gradient,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#00c4cc',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
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
              return `₹${context.parsed.y.toLocaleString('en-IN')}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#666'
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: '#f0f0f0'
          },
          ticks: {
            color: '#666',
            callback: (value) => {
              return `₹${value.toLocaleString('en-IN')}`;
            }
          }
        }
      }
    }
  });
};

const updateChart = () => {
  if (!chart) return;

  chart.data.labels = props.data.map(item => item.date);
  chart.data.datasets[0].data = props.data.map(item => item.amount);
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
.line-chart {
  width: 100%;
  height: 100%;
}
</style> 