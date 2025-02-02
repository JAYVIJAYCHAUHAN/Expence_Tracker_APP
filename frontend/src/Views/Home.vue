<template>
  <div class="home-container">
    <header class="hero-section text-center py-5 mb-4">
      <div class="hero-content">
        <div class="d-flex justify-content-center gap-2">
          <div class="h1 font-weight-bold">Welcome to Your</div>
          <div class="h1 tracker-title">Expense Tracker.</div>
        </div>
        <p>Keep track of your finances effortlessly.</p>
      </div>
    </header>
    <el-divider />
    <section class="image-card-section d-grid gap-4 p-4">
      <div class="card">
        <div class="card-body">
          <div class="image-container">
            <img
              src="@/assets/images/report.jpeg"
              alt="Spending Image"
              class="card-image"
            />
          </div>
          <div class="card-content">
            <h3 class="card-title">Track Your Spending</h3>
            <router-link to="/add-expense"> </router-link>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <div class="image-container">
            <img
              src="@/assets/images/spending.jpeg"
              alt="Spending Overview"
              class="card-image"
            />
          </div>
          <div class="card-content">
            <h3 class="card-title">Spending Overview</h3>
            <router-link to="/summary"> </router-link>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <div class="image-container">
            <img
              src="@/assets/images/monthly2.jpeg"
              alt="Manage Budgets"
              class="card-image"
            />
          </div>
          <div class="card-content">
            <h3 class="card-title">Manage Budgets</h3>
            <router-link to="/budget"> </router-link>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <div class="image-container">
            <img
              src="@/assets/images/monthly3.jpeg"
              alt="Monthly Report"
              class="card-image"
            />
          </div>
          <div class="card-content">
            <h3 class="card-title">Monthly Report</h3>
            <router-link to="/monthly-report"> </router-link>
          </div>
        </div>
      </div>
    </section>
    <el-divider />
    <UserRegistration />
    <el-divider />

    <!-- Footer Section -->
    <footer class="footer bg-dark text-white text-center py-3">
      <p>&copy; 2025 Expense Tracker. All Rights Reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import UserRegistration from "@/components/UserRegister.vue";
const router = useRouter();
const navigateToAddExpense = () => {
  router.push("/add-expense");
};
</script>

<style scoped>
.home-container {
  font-family: Arial, sans-serif;
}
.tracker-title {
  background-image: linear-gradient(90deg, #00c4cc, #9556e8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.image-card-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  justify-content: center;
}

.card {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  height: 320px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}
.card-body {
  padding: 15px;
}

.image-container {
  position: relative;
  height: 210px;
  overflow: hidden;
  border-radius: 10px;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  text-align: center;
  margin-top: 30px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: bold;
}
</style>
