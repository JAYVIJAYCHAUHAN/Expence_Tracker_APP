<template>
  <div class="container">
    <div class="hero-section">
      <div class="hero-content-left">
        <div class="h1 class-signup">
          Welcome to Your Expense Tracker! <br />
          Let's Get Started
        </div>
        <p class="lead">
          Track your spending and manage your budgets easily. <br />
          Sign up to start your financial journey.
        </p>
        <button
          type="button"
          class="btn btn-primary btn-size"
          @click="navigateToAddExpense"
        >
          Get Started
        </button>
      </div>

      <!-- Right Side: Image -->
      <div class="hero-content-right">
        <img
          src="@/assets/images/expencetracker.jpeg"
          alt="Expense Tracker"
          class="hero-image"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
const navigateToAddExpense = () => {
  router.push("/sign-up");
};
</script>

<style scoped>
.container {
  max-width: 1000px;
}

.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.hero-content-left {
  flex: 0 0 40%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 15px;
  padding: 20px;
}
.btn-size {
  width: 150px;
}
.class-signup {
  font-size: 3rem;
  line-height: 1.3;
  background-image: linear-gradient(90deg, #00c4cc, #9556e8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.lead {
  font-size: 1.2rem;
  color: #555;
}
.hero-content-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-image {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  object-fit: cover;
}

@media (max-width: 768px) {
  .hero-section {
    flex-direction: column-reverse;
    gap: 30px;
  }

  .hero-content-left {
    flex: unset;
    width: 100%;
    text-align: center;
  }

  .class-signup {
    font-size: 2.5rem;
  }

  .hero-content-right {
    width: 100%;
  }
}
</style>
