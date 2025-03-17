<script setup lang="ts">
</script>

<template>
  <div class="home">
    <div class="hero">
      <h1>Flash Card</h1>
      <router-link to="/decks" class="cta-button">
        Bắt đầu học ngay
      </router-link>
    </div>
    <div class="features">
      <div class="feature-card">
        <i class="fas fa-layer-group"></i>
        <h3>Quản lý bộ thẻ</h3>
        <p>Tạo và tổ chức các bộ thẻ từ vựng theo chủ đề</p>
      </div>
      <div class="feature-card">
        <i class="fas fa-sync-alt"></i>
        <h3>Học thông minh</h3>
        <p>Hệ thống ôn tập theo lịch trình tối ưu</p>
      </div>
      <div class="feature-card">
        <i class="fas fa-chart-line"></i>
        <h3>Theo dõi tiến độ</h3>
        <p>Xem thống kê và đánh giá quá trình học tập</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  border-radius: 1rem;
  color: white;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: white;
  color: #6366f1;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: bold;
  transition: transform 0.2s;
}

.cta-button:hover {
  transform: translateY(-2px);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  text-align: center;
}

.feature-card i {
  font-size: 2rem;
  color: #6366f1;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #666;
  line-height: 1.5;
}
</style>
