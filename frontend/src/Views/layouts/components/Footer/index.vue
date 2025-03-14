<template>
  <footer class="footer">
    <div class="footer-content">
      <!-- Company Info Section -->
      <div class="footer-section">
        <div class="company-info">
          <img src="@/assets/images/logo.jpeg" alt="Expense Tracker" class="footer-logo" />
          <h3 class="company-name">Expense Tracker</h3>
           <p class="company-description">With ❤️ from Kharka</p>
          <p class="company-description">
            Simplify your financial journey with our intuitive expense tracking solution.
          </p>
        </div>
        <div class="social-links">
          <a href="https://www.facebook.com/profile.php?id=100074616776179" class="social-link">
            <i class="bi bi-facebook"></i>
          </a>
          <a href="https://x.com/jvchauhan8874" class="social-link">
            <i class="bi bi-twitter-x"></i>
          </a>
          <a href="https://www.linkedin.com/in/jayvijay-chauhan" class="social-link">
            <i class="bi bi-linkedin"></i>
          </a>
          <a href="https://github.com/JAYVIJAYCHAUHAN" class="social-link">
            <i class="bi bi-github"></i>
          </a>
          <a href="https://shorturl.at/ftY08" class="social-link">
            <i class="bi bi-instagram"></i>
          </a>
        </div>
      </div>

      <!-- Newsletter Section -->
      <div class="footer-section">
        <h4 class="footer-title">Stay Updated</h4>
        <p class="newsletter-text">Subscribe to our newsletter for tips and updates.</p>
        <div class="newsletter-form">
          <el-input
            v-model="email"
            placeholder="Enter your email"
            class="newsletter-input"
          >
            <template #append>
              <el-button class="subscribe-btn" @click="handleSubscribe">
                Subscribe
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

const email = ref('');
const currentYear = computed(() => new Date().getFullYear());

const handleSubscribe = () => {
  if (!email.value) {
    ElMessage.warning('Please enter your email address');
    return;
  }
  
  if (!validateEmail(email.value)) {
    ElMessage.error('Please enter a valid email address');
    return;
  }

  ElMessage.success('Thank you for subscribing!');
  email.value = '';
};

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
</script>

<style scoped>
.footer {
  background: linear-gradient(to right, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.98));
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 196, 204, 0.1);
  padding: 40px 0;
  margin-top: 60px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  padding: 0 20px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.company-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
}

.footer-logo {
  width: 50px;
  height: 50px;
  border-radius: 12px;
}

.company-name {
  background-image: linear-gradient(135deg, #00c4cc, #7209b7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: bold;
  font-size: 1.5rem;
  margin: 0;
}

.company-description {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.social-links {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.social-link {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00c4cc20, #7209b720);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #336ad7;
  transition: all 0.3s ease;
}

.social-link:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  color: white;
}

.footer-title {
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 15px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: #666;
  text-decoration: none;
  transition: all 0.3s ease;
}

.footer-links a:hover {
  color: #00c4cc;
  transform: translateX(5px);
}

.newsletter-text {
  color: #666;
  margin-bottom: 15px;
}

.newsletter-form {
  display: flex;
  gap: 10px;
}

.newsletter-input {
  width: 100%;
}

.subscribe-btn {
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  border: none;
  color: white;
  transition: all 0.3s ease;
}

.subscribe-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 196, 204, 0.2);
}

@media only screen and (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}

@media only screen and (max-width: 576px) {
  .footer {
    padding: 30px 0;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .company-info {
    align-items: center;
    text-align: center;
  }

  .social-links {
    justify-content: center;
  }

  .footer-section {
    align-items: center;
    text-align: center;
  }
}
</style> 