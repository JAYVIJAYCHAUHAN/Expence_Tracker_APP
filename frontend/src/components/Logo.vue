<template>
  <div class="nav-header">
    <div class="logo-header">
      <div id="logo">
        <img src="@/assets/images/expencetracker.jpeg" alt="Expense Tracker" />
        <span>Expense Tracker</span>
      </div>
    </div>
    <!-- You can add additional nav items or links here -->
  </div>
</template>

<style scoped>
/* General styles for the nav header */
.nav-header {
  width: 100%;
  background-color: #fff;
  padding: 15px 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  z-index: 100;
}

/* Logo and text styling */
#logo {
  display: flex;
  align-items: center;
}

#logo img {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 50%;
  object-fit: cover;
}

#logo span {
  color: #303133;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Additional spacing and styling on small screens */
@media (max-width: 768px) {
  .nav-header {
    padding: 10px 15px;
  }

  #logo span {
    font-size: 18px;
  }
}
</style>
