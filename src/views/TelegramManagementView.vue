<template>
  <div class="telegram-management">
    <!-- Header -->
    <div class="management-header">
      <h1>🤖 Quản Lý Telegram Bot</h1>
      <p class="subtitle">Quản lý người dùng, lịch gửi tin nhắn và broadcast flashcard</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalTelegramUsers }}</div>
          <div class="stat-label">Tổng Users</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔔</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.enabledNotifications }}</div>
          <div class="stat-label">Bật Thông Báo</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏰</div>
        <div class="stat-content">
          <div class="stat-number">{{ scheduleConfig.filter(s => s.enabled).length }}</div>
          <div class="stat-label">Time Slots Hoạt Động</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.dailyReminderUsers }}</div>
          <div class="stat-label">Nhận Nhắc Nhở</div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="['tab-button', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- Schedule Management Tab -->
    <div v-if="activeTab === 'schedule'" class="tab-content">
      <div class="section-header">
        <h2>⏰ Quản Lý Lịch Gửi Tin Nhắn</h2>
        <button class="btn btn-primary" @click="showAddTimeSlot = true">
          ➕ Thêm Time Slot
        </button>
      </div>

      <div class="schedule-grid">
        <div 
          v-for="schedule in scheduleConfig" 
          :key="schedule.label"
          class="schedule-card"
        >
          <div class="schedule-header">
            <div class="schedule-time">{{ schedule.label }}</div>
            <div class="schedule-status">
              <span :class="['status-badge', schedule.enabled ? 'enabled' : 'disabled']">
                {{ schedule.enabled ? '🟢 Hoạt động' : '🔴 Tắt' }}
              </span>
            </div>
          </div>
          <div class="schedule-details">
            <div class="cron-expression">Cron: {{ schedule.time }}</div>
            <div class="schedule-actions">
              <button 
                :class="['btn', schedule.enabled ? 'btn-warning' : 'btn-success']"
                @click="toggleTimeSlot(schedule.label, !schedule.enabled)"
              >
                {{ schedule.enabled ? '⏸️ Tắt' : '▶️ Bật' }}
              </button>
              <button class="btn btn-danger" @click="removeTimeSlot(schedule.label)">
                🗑️ Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Management Tab -->
    <div v-if="activeTab === 'users'" class="tab-content">
      <div class="section-header">
        <h2>👥 Quản Lý Người Dùng Telegram</h2>
        <div class="header-actions">
          <button class="btn btn-info" @click="syncUsers">
            🔄 Đồng Bộ Users
          </button>
          <button class="btn btn-success" @click="showBroadcast = true">
            📢 Broadcast
          </button>
        </div>
      </div>

      <div class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Username</th>
              <th>Chat ID</th>
              <th>Thông Báo</th>
              <th>Ngày Tham Gia</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.telegramChatId">
              <td>{{ user.name }}</td>
              <td>@{{ user.telegramUsername || 'N/A' }}</td>
              <td><code>{{ user.telegramChatId }}</code></td>
              <td>
                <span :class="['status-badge', user.telegramNotifications?.enabled ? 'enabled' : 'disabled']">
                  {{ user.telegramNotifications?.enabled ? '✅ Bật' : '❌ Tắt' }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button 
                    class="btn btn-sm btn-primary" 
                    @click="sendCardToUser(user.telegramChatId, user.name)"
                  >
                    🎴 Gửi Card
                  </button>
                  <button 
                    class="btn btn-sm btn-info" 
                    @click="editUser(user)"
                  >
                    ⚙️ Cài Đặt
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick Actions Tab -->
    <div v-if="activeTab === 'actions'" class="tab-content">
      <div class="section-header">
        <h2>🚀 Thao Tác Nhanh</h2>
      </div>

      <div class="quick-actions-grid">
        <div class="quick-action-card" @click="sendDailyNotifications">
          <div class="action-icon">📨</div>
          <div class="action-title">Gửi Thông Báo Ngay</div>
          <div class="action-desc">Trigger gửi flashcard cho tất cả users</div>
        </div>

        <div class="quick-action-card" @click="testBot">
          <div class="action-icon">🧪</div>
          <div class="action-title">Test Bot</div>
          <div class="action-desc">Kiểm tra bot có hoạt động không</div>
        </div>

        <div class="quick-action-card" @click="showBroadcast = true">
          <div class="action-icon">📢</div>
          <div class="action-title">Broadcast Tin Nhắn</div>
          <div class="action-desc">Gửi tin nhắn tùy chỉnh</div>
        </div>

        <div class="quick-action-card" @click="syncUsers">
          <div class="action-icon">🔄</div>
          <div class="action-title">Đồng Bộ Users</div>
          <div class="action-desc">Cập nhật danh sách từ Telegram</div>
        </div>
      </div>
    </div>

    <!-- Add Time Slot Modal -->
    <div v-if="showAddTimeSlot" class="modal-overlay" @click="showAddTimeSlot = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>➕ Thêm Time Slot Mới</h3>
          <button class="modal-close" @click="showAddTimeSlot = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nhãn Time Slot:</label>
            <input 
              v-model="newTimeSlot.label" 
              type="text" 
              placeholder="VD: 6:00 PM"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label>Cron Expression:</label>
            <input 
              v-model="newTimeSlot.time" 
              type="text" 
              placeholder="VD: 0 18 * * * (6:00 PM mỗi ngày)"
              class="form-input"
            >
            <small class="form-help">
              Format: phút giờ ngày tháng thứ<br>
              VD: "0 18 * * *" = 6:00 PM mỗi ngày
            </small>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddTimeSlot = false">Hủy</button>
          <button class="btn btn-primary" @click="addTimeSlot">Thêm</button>
        </div>
      </div>
    </div>

    <!-- Broadcast Modal -->
    <div v-if="showBroadcast" class="modal-overlay" @click="showBroadcast = false">
      <div class="modal large" @click.stop>
        <div class="modal-header">
          <h3>📢 Broadcast Tin Nhắn</h3>
          <button class="modal-close" @click="showBroadcast = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Loại Tin Nhắn:</label>
            <select v-model="broadcast.type" class="form-input">
              <option value="text">📝 Tin nhắn text tùy chỉnh</option>
              <option value="card">🎴 Flashcard ngẫu nhiên</option>
            </select>
          </div>
          
          <div v-if="broadcast.type === 'text'" class="form-group">
            <label>Nội dung tin nhắn:</label>
            <textarea 
              v-model="broadcast.message" 
              class="form-textarea"
              rows="4"
              placeholder="Nhập nội dung tin nhắn..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>Gửi đến:</label>
            <select v-model="broadcast.target" class="form-input">
              <option value="all">📤 Tất cả users có bật thông báo</option>
              <option value="selected">👥 Users được chọn</option>
            </select>
          </div>

          <div v-if="broadcast.target === 'selected'" class="form-group">
            <label>Chọn Users:</label>
            <div class="user-selection">
              <div 
                v-for="user in users" 
                :key="user.telegramChatId"
                class="user-checkbox"
              >
                <input 
                  :id="'user-' + user.telegramChatId"
                  v-model="broadcast.selectedUsers"
                  :value="user.telegramChatId"
                  type="checkbox"
                >
                <label :for="'user-' + user.telegramChatId">
                  {{ user.name }} (@{{ user.telegramUsername || 'N/A' }})
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showBroadcast = false">Hủy</button>
          <button class="btn btn-primary" @click="sendBroadcast" :disabled="!canSendBroadcast">
            📤 Gửi {{ broadcast.target === 'all' ? 'Tất Cả' : `${broadcast.selectedUsers.length} Users` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">⏳ Đang xử lý...</div>
    </div>
  </div>
</template>


<script>
import { ref, onMounted, computed } from 'vue'
import { apiRequest } from '../api/index'

export default {
  name: 'TelegramManagementView',
  setup() {
    // Reactive data
    const activeTab = ref('users')
    const loading = ref(false)
    const stats = ref({
      totalTelegramUsers: 0,
      enabledNotifications: 0,
      dailyReminderUsers: 0
    })
    const users = ref([])
    const scheduleConfig = ref([])
    const showAddTimeSlot = ref(false)
    const showBroadcast = ref(false)
    
    const newTimeSlot = ref({
      label: '',
      time: ''
    })

    const broadcast = ref({
      type: 'card',
      message: '',
      target: 'all',
      selectedUsers: []
    })

    // Tabs configuration
    const tabs = ref([
        { key: 'users', label: 'Người Dùng', icon: '👥' },
        { key: 'actions', label: 'Thao Tác', icon: '🚀' },
      { key: 'schedule', label: 'Lịch Gửi', icon: '⏰' },
    ])

    // Computed
    const canSendBroadcast = computed(() => {
      if (broadcast.value.type === 'text' && !broadcast.value.message.trim()) {
        return false
      }
      if (broadcast.value.target === 'selected' && broadcast.value.selectedUsers.length === 0) {
        return false
      }
      return true
    })

    // Import apiRequest
    // ...existing code...

    // Helper for Telegram API
    const telegramApiRequest = async (endpoint, method = 'GET', data = null, customHeaders = {}) => {
      // All Telegram API endpoints are prefixed with /telegram
      return apiRequest(`/telegram${endpoint}`, method, data, customHeaders)
    }

    // Methods
    const loadStats = async () => {
      try {
        const response = await telegramApiRequest('/stats')
        stats.value = response.stats
      } catch (error) {
        console.error('Lỗi load stats:', error)
        alert('Không thể tải thống kê')
      }
    }

    const loadUsers = async () => {
      try {
        const response = await telegramApiRequest('/users')
        users.value = response.users
      } catch (error) {
        console.error('Lỗi load users:', error)
        alert('Không thể tải danh sách users')
      }
    }

    const loadSchedule = async () => {
      try {
        const response = await telegramApiRequest('/schedule')
        scheduleConfig.value = response.schedule
      } catch (error) {
        console.error('Lỗi load schedule:', error)
        alert('Không thể tải cấu hình lịch')
      }
    }

    const toggleTimeSlot = async (timeLabel, enabled) => {
      try {
        loading.value = true
        await telegramApiRequest('/schedule/toggle', 'POST', { timeLabel, enabled })
        // Cập nhật local state
        const schedule = scheduleConfig.value.find(s => s.label === timeLabel)
        if (schedule) {
          schedule.enabled = enabled
        }
        alert(`Đã ${enabled ? 'bật' : 'tắt'} time slot ${timeLabel}`)
      } catch (error) {
        console.error('Lỗi toggle time slot:', error)
        alert('Không thể thay đổi trạng thái time slot')
      } finally {
        loading.value = false
      }
    }

    const addTimeSlot = async () => {
      if (!newTimeSlot.value.label || !newTimeSlot.value.time) {
        alert('Vui lòng nhập đầy đủ thông tin')
        return
      }
      try {
        loading.value = true
        await telegramApiRequest('/schedule/add', 'POST', newTimeSlot.value)
        showAddTimeSlot.value = false
        newTimeSlot.value = { label: '', time: '' }
        await loadSchedule()
        alert('Đã thêm time slot mới')
      } catch (error) {
        console.error('Lỗi thêm time slot:', error)
        alert('Không thể thêm time slot')
      } finally {
        loading.value = false
      }
    }

    const removeTimeSlot = async (timeLabel) => {
      if (!confirm(`Bạn có chắc muốn xóa time slot "${timeLabel}"?`)) {
        return
      }
      try {
        loading.value = true
        await telegramApiRequest(`/schedule/${encodeURIComponent(timeLabel)}`, 'DELETE')
        await loadSchedule()
        alert(`Đã xóa time slot ${timeLabel}`)
      } catch (error) {
        console.error('Lỗi xóa time slot:', error)
        alert('Không thể xóa time slot')
      } finally {
        loading.value = false
      }
    }

    const sendDailyNotifications = async () => {
      if (!confirm('Gửi flashcard ngay cho tất cả users?')) {
        return
      }
      try {
        loading.value = true
        const response = await telegramApiRequest('/send-daily-notifications', 'POST')
        alert(`Hoàn thành! Gửi thành công: ${response.result?.success || 0}, Thất bại: ${response.result?.failed || 0}`)
      } catch (error) {
        console.error('Lỗi gửi thông báo:', error)
        alert('Không thể gửi thông báo')
      } finally {
        loading.value = false
      }
    }

    const testBot = async () => {
      try {
        loading.value = true
        const response = await telegramApiRequest('/test')
        if (response.success) {
          alert(`✅ Bot hoạt động bình thường!\nBot: ${response.botInfo?.first_name}\nUsername: @${response.botInfo?.username}`)
        } else {
          alert('❌ Bot không hoạt động')
        }
      } catch (error) {
        console.error('Lỗi test bot:', error)
        alert('Không thể test bot')
      } finally {
        loading.value = false
      }
    }

    const syncUsers = async () => {
      try {
        loading.value = true
        const response = await telegramApiRequest('/sync-users', 'POST')
        await loadUsers()
        await loadStats()
        alert(`Đã đồng bộ ${response.syncedUsers} users từ Telegram`)
      } catch (error) {
        console.error('Lỗi sync users:', error)
        alert('Không thể đồng bộ users')
      } finally {
        loading.value = false
      }
    }

    const sendCardToUser = async (chatId, userName) => {
      if (!confirm(`Gửi flashcard ngẫu nhiên cho ${userName}?`)) {
        return
      }
      try {
        loading.value = true
        await telegramApiRequest(`/send-card/${chatId}`, 'POST')
        alert(`Đã gửi flashcard cho ${userName}`)
      } catch (error) {
        console.error('Lỗi gửi card:', error)
        alert('Không thể gửi flashcard')
      } finally {
        loading.value = false
      }
    }

    const sendBroadcast = async () => {
      try {
        loading.value = true
        const payload = {
          type: broadcast.value.type,
          message: broadcast.value.message,
          userIds: broadcast.value.target === 'selected' ? broadcast.value.selectedUsers : null
        }
        const response = await telegramApiRequest('/broadcast', 'POST', payload)
        showBroadcast.value = false
        broadcast.value = {
          type: 'card',
          message: '',
          target: 'all',
          selectedUsers: []
        }
        alert(`Hoàn thành broadcast! Thành công: ${response.result.success}, Thất bại: ${response.result.failed}`)
      } catch (error) {
        console.error('Lỗi broadcast:', error)
        alert('Không thể gửi broadcast')
      } finally {
        loading.value = false
      }
    }

    const editUser = (user) => {
      // TODO: Implement user settings modal
      alert(`Tính năng chỉnh sửa settings cho ${user.name} sẽ được thêm sau`)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('vi-VN')
    }

    // Lifecycle
    onMounted(async () => {
      loading.value = true
      try {
        await Promise.all([
          loadStats(),
          loadUsers(),
          loadSchedule()
        ])
      } catch (error) {
        console.error('Lỗi load dữ liệu:', error)
      } finally {
        loading.value = false
      }
    })

    return {
      // Data
      activeTab,
      loading,
      stats,
      users,
      scheduleConfig,
      showAddTimeSlot,
      showBroadcast,
      newTimeSlot,
      broadcast,
      tabs,
      
      // Computed
      canSendBroadcast,
      
      // Methods
      toggleTimeSlot,
      addTimeSlot,
      removeTimeSlot,
      sendDailyNotifications,
      testBot,
      syncUsers,
      sendCardToUser,
      sendBroadcast,
      editUser,
      formatDate
    }
  }
}
</script>

<style scoped>
.telegram-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.management-header {
  text-align: center;
  margin-bottom: 30px;
}

.management-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 16px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-left: 4px solid #3498db;
}

.stat-icon {
  font-size: 40px;
  margin-right: 15px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  color: #7f8c8d;
  font-size: 14px;
}

/* Tabs */
.tabs {
  display: flex;
  border-bottom: 2px solid #ecf0f1;
  margin-bottom: 30px;
}

.tab-button {
  background: none;
  border: none;
  padding: 15px 25px;
  cursor: pointer;
  font-size: 16px;
  color: #7f8c8d;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #3498db;
}

.tab-button.active {
  color: #3498db;
  border-bottom-color: #3498db;
  font-weight: bold;
}

/* Tab Content */
.tab-content {
  min-height: 400px;
}

.section-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* Schedule Grid */
.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.schedule-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border: 1px solid #ecf0f1;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.schedule-time {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.enabled {
  background: #d5f4e6;
  color: #27ae60;
}

.status-badge.disabled {
  background: #fadbd8;
  color: #e74c3c;
}

.cron-expression {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 14px;
  color: #495057;
  margin-bottom: 15px;
}

.schedule-actions {
  display: flex;
  gap: 10px;
}

/* Users Table */
.users-table-container {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: #f8f9fa;
  padding: 15px;
  text-align: left;
  font-weight: bold;
  color: #2c3e50;
  border-bottom: 2px solid #ecf0f1;
}

.users-table td {
  padding: 15px;
  border-bottom: 1px solid #ecf0f1;
}

.users-table tr:hover {
  background: #f8f9fa;
}

.action-buttons {
  display: flex;
  gap: 5px;
}

/* Quick Actions */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.quick-action-card {
  background: white;
  border-radius: 10px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border: 1px solid #ecf0f1;
  transition: all 0.3s ease;
}

.quick-action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.action-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.action-title {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10px;
}

.action-desc {
  color: #7f8c8d;
  font-size: 14px;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover {
  background: #229954;
}

.btn-warning {
  background: #f39c12;
  color: white;
}

.btn-warning:hover {
  background: #e67e22;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal.large {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ecf0f1;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
}

.modal-close:hover {
  color: #2c3e50;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #ecf0f1;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Form */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #2c3e50;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-help {
  color: #7f8c8d;
  font-size: 12px;
  margin-top: 5px;
}

.user-selection {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
}

.user-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-checkbox input {
  margin-right: 10px;
}

/* Loading */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.loading-spinner {
  background: #2c3e50;
  color: white;
  padding: 20px 40px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
}

/* Responsive */
@media (max-width: 768px) {
  .telegram-management {
    padding: 10px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .tabs {
    flex-wrap: wrap;
  }
  
  .tab-button {
    flex: 1;
    min-width: 120px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .schedule-grid,
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .users-table-container {
    overflow-x: auto;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 5px;
  }
}
</style> 