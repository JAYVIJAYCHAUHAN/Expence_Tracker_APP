<template>
  <div class="report-container">
    <div class="report-header">
      <h2>Expense Report</h2>
      <p>Track and analyze your spending patterns</p>
    </div>

    <!-- Date Range Filter -->
    <div class="filter-section mb-2">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="to"
            start-placeholder="Start Date"
            end-placeholder="End Date"
            :shortcuts="dateShortcuts"
            @change="handleDateChange"
          />
          <div class="text-right">  
          <el-button type="primary" @click="generateReport">
            <i class="bi bi-file-pdf me-2"></i>  Download PDF Report
          </el-button>
          </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8">
          <div class="summary-card total-expenses">
            <div class="card-icon">
              <i class="bi bi-wallet2"></i>
            </div>
            <div class="card-content">
              <h3>Total Expenses</h3>
              <p class="amount">₹{{ formatAmount(totalExpenses) }}</p>
              <p class="trend" :class="{ 'positive': expenseTrend < 0, 'negative': expenseTrend > 0 }">
                <i :class="expenseTrend > 0 ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
                {{ Math.abs(expenseTrend) }}% from last period
              </p>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="summary-card average-daily">
            <div class="card-icon">
              <i class="bi bi-calendar3"></i>
            </div>
            <div class="card-content">
              <h3>Average Daily</h3>
              <p class="amount">₹{{ formatAmount(averageDaily) }}</p>
              <p class="comparison">vs ₹{{ formatAmount(targetDaily) }} target</p>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="summary-card top-category">
            <div class="card-icon">
              <i class="bi bi-pie-chart"></i>
            </div>
            <div class="card-content">
              <h3>Top Category</h3>
              <p class="category">{{ topCategory.name }}</p>
              <p class="amount">₹{{ formatAmount(topCategory.amount) }}</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="14">
          <div class="chart-card">
            <div class="chart-header">
              <h3>Expense Trend</h3>
              <el-radio-group v-model="trendTimeframe" size="small" @change="updateTrendData">
                <el-radio-button label="weekly">Weekly</el-radio-button>
                <el-radio-button label="monthly">Monthly</el-radio-button>
              </el-radio-group>
            </div>
            <div class="chart-container">
              <LineChart :data="trendData" ref="lineChartRef" />
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :lg="10">
          <div class="chart-card">
            <div class="chart-header">
              <h3>Category Distribution</h3>
            </div>
            <div class="chart-container">
              <PieChart :data="categoryData" ref="pieChartRef" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Recent Transactions -->
    <!-- <div class="transactions-section">
      <h3>Recent Transactions</h3>
      <el-table :data="recentTransactions" style="width: 100%">
        <el-table-column prop="date" label="Date" width="120">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="category" label="Category" width="150">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Description" />
        <el-table-column prop="amount" label="Amount" width="150" align="right">
          <template #default="{ row }">
            ₹{{ formatAmount(row.amount) }}
          </template>
        </el-table-column>
      </el-table>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import LineChart from '@/components/charts/LineChart.vue';
import PieChart from '@/components/charts/PieChart.vue';
import axios from 'axios';
import type { CategoryData, Expense, TrendData } from '@/type/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const router = useRouter();
const API_URL =  import.meta.env.VITE_API_URL;

// Date range picker shortcuts
const dateShortcuts = [
  {
    text: 'Last week',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: 'Last month',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      return [start, end];
    },
  },
  {
    text: 'Last 3 months',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      return [start, end];
    },
  },
];

// State
const dateRange = ref<Date[]>([]);
const trendTimeframe = ref('weekly');
const totalExpenses = ref(0);
const expenseTrend = ref(0);
const averageDaily = ref(0);
const targetDaily = ref(1000); // This could be fetched from user settings
const topCategory = ref({ name: '', amount: 0 });
const expenses = ref<Expense[]>([]);

// Chart data
const trendData = ref<TrendData[]>([]);
const categoryData = ref<CategoryData[]>([]);
const recentTransactions = ref<Expense[]>([]);

// Add refs for chart components
const lineChartRef = ref<InstanceType<typeof LineChart> | null>(null);
const pieChartRef = ref<InstanceType<typeof PieChart> | null>(null);

// Fetch expenses for the selected date range
const fetchExpenses = async () => {
  try {
    const [start, end] = dateRange.value;
    const response = await axios.get(`${API_URL}/expenses`, {
      params: {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    expenses.value = response.data;
    updateReportData();
  } catch (error: any) {
    if (error.response?.status === 401) {
      ElMessage.error('Please signup to view the report');
      router.push('/signup');
    } else {
      ElMessage.error('Failed to fetch expense data');
      console.error('Error fetching expenses:', error);
    }
  }
};

// Update all report data based on fetched expenses
const updateReportData = () => {
  updateTotalExpenses();
  updateTrendData();
  updateCategoryData();
  updateRecentTransactions();
};

// Calculate total expenses and trend
const updateTotalExpenses = () => {
  const currentTotal = expenses.value.reduce((sum, expense) => sum + expense.amount, 0);
  totalExpenses.value = currentTotal;

  // Calculate trend (comparing with previous period)
  const [start, end] = dateRange.value;
  const periodLength = end.getTime() - start.getTime();
  const previousStart = new Date(start.getTime() - periodLength);
  const previousEnd = new Date(end.getTime() - periodLength);

  // Fetch previous period data and calculate trend
  axios.get(`${API_URL}/expenses`, {
    params: {
      startDate: previousStart.toISOString(),
      endDate: previousEnd.toISOString()
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }).then(response => {
    const previousTotal = response.data.reduce((sum: number, expense: any) => sum + expense.amount, 0);
    if (previousTotal > 0) {
      expenseTrend.value = ((currentTotal - previousTotal) / previousTotal) * 100;
    }
  }).catch(console.error);

  // Calculate average daily
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  averageDaily.value = currentTotal / days;
};

// Update trend chart data
const updateTrendData = () => {
  const groupedExpenses = new Map();
  
  expenses.value.forEach(expense => {
    const date = new Date(expense.date);
    let key;
    
    if (trendTimeframe.value === 'weekly') {
      // Get the Monday of the week
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      key = new Date(date.setDate(diff)).toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    groupedExpenses.set(key, (groupedExpenses.get(key) || 0) + expense.amount);
  });

  trendData.value = Array.from(groupedExpenses.entries()).map(([date, amount]) => ({
    date,
    amount
  })).sort((a, b) => a.date.localeCompare(b.date));
};

// Update category distribution data
const updateCategoryData = () => {
  const categories = new Map();
  
  expenses.value.forEach(expense => {
    categories.set(expense.category, (categories.get(expense.category) || 0) + expense.amount);
  });

  categoryData.value = Array.from(categories.entries()).map(([name, value]) => ({
    name,
    value
  }));

  // Update top category
  if (categoryData.value.length > 0) {
    const topCat = categoryData.value.reduce((max, cat) => 
      cat.value > max.value ? cat : max
    );
    topCategory.value = { name: topCat.name, amount: topCat.value };
  }
};

// Update recent transactions
const updateRecentTransactions = () => {
  recentTransactions.value = [...expenses.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
};

// Handle date range change
const handleDateChange = () => {
  if (dateRange.value[0] && dateRange.value[1]) {
    fetchExpenses();
  }
};

// Format helpers
const formatAmount = (amount: number) => {
  return amount.toLocaleString('en-IN');
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN');
};

const getCategoryType = (category: string) => {
  const types: { [key: string]: string } = {
    'Groceries': 'success',
    'Transportation': 'warning',
    'Entertainment': 'info',
    'Utilities': 'danger',
    'Shopping': 'primary',
    'Bills': 'warning',
    'Others': 'info'
  };
  return types[category] || 'default';
};

// Generate and download report as PDF
const generateReport = () => {
  // Create a new jsPDF instance
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Add a subtle background gradient to the first page
  const grd = doc.setFillColor(240, 240, 250);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Set fonts and formatting
  doc.setFontSize(24);
  doc.setTextColor(0, 130, 150);
  doc.text("Expense Tracker Report", pageWidth / 2, 20, { align: 'center' });
  
  // Add logo/branding
  doc.setDrawColor(0, 196, 204);
  doc.setLineWidth(1);
  doc.line(20, 25, pageWidth - 20, 25);
  
  // Add date range
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  const dateRangeText = `Date Range: ${formatDate(dateRange.value[0].toISOString())} to ${formatDate(dateRange.value[1].toISOString())}`;
  doc.text(dateRangeText, pageWidth / 2, 32, { align: 'center' });
  
  // Add summary section
  doc.setFillColor(240, 250, 250);
  doc.roundedRect(14, 40, pageWidth - 28, 40, 3, 3, 'F');
  
  doc.setFontSize(14);
  doc.setTextColor(0, 130, 150);
  doc.text("Summary", 20, 50);
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'bold');
  doc.text("Total Expenses:", 25, 60);
  doc.text("Average Daily:", 25, 70);
  doc.text("Top Category:", 25, 80);
  
  // Summary values with better right alignment
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`₹${formatAmount(totalExpenses.value)}`, 110, 60);
  doc.text(`₹${formatAmount(averageDaily.value)}`, 110, 70);
  doc.text(`${topCategory.value.name} (₹${formatAmount(topCategory.value.amount)})`, 110, 80);
  
  // Add trend indicator
  if (expenseTrend.value !== 0) {
    const trendColor = expenseTrend.value < 0 ? [40, 167, 69] : [220, 53, 69];
    const trendIcon = expenseTrend.value < 0 ? '↓' : '↑';
    const trendText = `${trendIcon} ${Math.abs(expenseTrend.value).toFixed(1)}% from last period`;
    
    doc.setTextColor(trendColor[0], trendColor[1], trendColor[2]);
    doc.text(trendText, 140, 60);
  }
  
  // Add trend chart if available
  if (lineChartRef.value) {
    const trendChartImage = lineChartRef.value.getChartImage();
    if (trendChartImage) {
      // Add a subtle background for the chart
      doc.setFillColor(250, 250, 255);
      doc.roundedRect(14, 90, pageWidth - 28, 90, 3, 3, 'F');
      
      doc.setFontSize(14);
      doc.setTextColor(0, 130, 150);
      doc.text("Expense Trend", 20, 100);
      
      doc.addImage(trendChartImage, 'PNG', 20, 105, 170, 70);
    }
  }
  
  // Add pie chart if available
  if (pieChartRef.value) {
    const pieChartImage = pieChartRef.value.getChartImage();
    if (pieChartImage) {
      // Add a subtle background for the chart
      doc.setFillColor(250, 250, 255);
      doc.roundedRect(14, 190, pageWidth - 28, 90, 3, 3, 'F');
      
      doc.setFontSize(14);
      doc.setTextColor(0, 130, 150);
      doc.text("Category Distribution", 20, 200);
      
      doc.addImage(pieChartImage, 'PNG', 50, 205, 110, 70);
    }
  }
  
  // Add a new page for more details
  doc.addPage();
  
  // Add a light background to the second page
  doc.setFillColor(248, 248, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Add header to the second page
  doc.setFontSize(20);
  doc.setTextColor(0, 130, 150);
  doc.text("Expense Details", pageWidth / 2, 20, { align: 'center' });
  
  doc.setDrawColor(0, 196, 204);
  doc.setLineWidth(0.5);
  doc.line(20, 25, pageWidth - 20, 25);
  
  // Create a table for category distribution
  doc.setFontSize(14);
  doc.setTextColor(0, 130, 150);
  doc.text("Category Details", 20, 40);
  
  const categoryRows = categoryData.value.map(category => [
    category.name,
    { content: `₹${formatAmount(category.value)}`, styles: { halign: 'right' as const } },
    { content: `${((category.value / totalExpenses.value) * 100).toFixed(1)}%`, styles: { halign: 'right' as const } }
  ]);
  
  autoTable(doc, {
    head: [
      [
        { content: 'Category', styles: { halign: 'left' as const } },
        { content: 'Amount', styles: { halign: 'right' as const } },
        { content: 'Percentage', styles: { halign: 'right' as const } }
      ]
    ],
    body: categoryRows,
    startY: 45,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 150, 180],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      lineWidth: 0.1,
      lineColor: [0, 0, 0]
    },
    styles: {
      cellPadding: 6,
      fontSize: 10,
      overflow: 'linebreak',
      lineColor: [220, 220, 220]
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 60 },
      2: { cellWidth: 50 }
    },
    alternateRowStyles: {
      fillColor: [248, 248, 255]
    },
    margin: { left: 20, right: 20 }
  });
  
  // Add recent transactions table
  let startY = 45;
  // Check if the autoTable plugin has set a finalY value
  // @ts-ignore - accessing jspdf-autotable's added property
  if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
    // @ts-ignore
    startY = doc.lastAutoTable.finalY + 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(0, 130, 150);
  doc.text("Recent Transactions", 20, startY);

  const transactionRows = recentTransactions.value.map(transaction => [
    formatDate(transaction.date),
    transaction.category,
    transaction.description,
    { content: `₹${formatAmount(transaction.amount)}`, styles: { halign: 'right' as const } }
  ]);

  autoTable(doc, {
    head: [
      [
        { content: 'Date', styles: { halign: 'left' as const } },
        { content: 'Category', styles: { halign: 'left' as const } },
        { content: 'Description', styles: { halign: 'left' as const } },
        { content: 'Amount', styles: { halign: 'right' as const } }
      ]
    ],
    body: transactionRows,
    startY: startY + 5,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 150, 180],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      lineWidth: 0.1,
      lineColor: [0, 0, 0]
    },
    styles: {
      cellPadding: 6,
      fontSize: 9,
      overflow: 'linebreak',
      lineColor: [220, 220, 220]
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 50 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 40 }
    },
    alternateRowStyles: {
      fillColor: [248, 248, 255]
    },
    margin: { left: 20, right: 20 }
  });
  
  // Add footer with date and page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const today = new Date().toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(`Generated on ${today} | Expense Tracker App`, 20, pageHeight - 10);
    
    // Page numbers
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
  }
  
  // Save the PDF
  const fileName = `expense-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  ElMessage.success('PDF report downloaded successfully');
};

// Setup axios interceptor for authentication
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Initialize data on mount
onMounted(() => {
  // Initialize with last month's date range
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  dateRange.value = [start, end];
  
  // Fetch initial data
  fetchExpenses();
});

// Watch for changes in expenses to update the report
watch(expenses, () => {
  updateReportData();
}, { deep: true });

// Watch for changes in trend timeframe
watch(trendTimeframe, () => {
  updateTrendData();
});
</script>

<style scoped>
.report-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.report-header {
  text-align: center;
  margin-bottom: 32px;
}

.report-header h2 {
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 2rem;
  margin-bottom: 8px;
}

.report-header p {
  color: #666;
}

.filter-section {
 display:grid;
 grid-template-columns: 290px auto;
 column-gap:16px;
 align-items:center;
 @media (max-width:768px) {
  grid-template-columns:300px;
  row-gap:8px;
  
 }
}

.text-right {
  text-align: right;
}

.summary-section {
  margin-bottom: 32px;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.total-expenses .card-icon {
  background: rgba(0, 196, 204, 0.1);
  color: #00c4cc;
}

.average-daily .card-icon {
  background: rgba(114, 9, 183, 0.1);
  color: #7209b7;
}

.top-category .card-icon {
  background: rgba(255, 159, 67, 0.1);
  color: #ff9f43;
}

.card-content h3 {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 4px;
}

.amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.trend {
  font-size: 0.9rem;
  margin: 4px 0 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend.positive {
  color: #28c76f;
}

.trend.negative {
  color: #ea5455;
}

.comparison {
  font-size: 0.9rem;
  color: #666;
  margin: 4px 0 0;
}

.category {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 4px;
}

.charts-section {
  margin-bottom: 32px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  font-size: 1.1rem;
  color: #333;
  margin: 0;
}

.chart-container {
  height: 300px;
}

.transactions-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.transactions-section h3 {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 20px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .report-container {
    padding: 16px;
  }

  

  .text-right {
    text-align: left;
  }

  .chart-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
