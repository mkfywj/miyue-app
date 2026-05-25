<template>
  <view class="profile-page">
    <!-- 用户信息 -->
    <view class="user-card">
      <image class="avatar" :src="user.avatar_url || '/static/default-avatar.png'" mode="aspectFill" @click="changeAvatar"></image>
      <text class="name">{{ user.nickname || '用户' }}</text>
      <text class="info">{{ genderText }} · {{ user.city || '未设置' }} · {{ user.birth_year ? getAge(user.birth_year)+'岁' : '' }}</text>
      <text class="vip-badge" v-if="user.vip_level > 0 && isVip">🌟 VIP{{ user.vip_level }} {{ vipDaysLeft }}天</text>
      <text class="bio" v-if="user.bio">{{ user.bio }}</text>
    </view>

    <!-- 数据统计 -->
    <view class="stats">
      <view class="stat-item" @click="goMyPosts">
        <text class="stat-num">{{ postCount }}</text>
        <text class="stat-label">动态</text>
      </view>
      <view class="stat-item" @click="goMyGroups">
        <text class="stat-num">{{ groupCount }}</text>
        <text class="stat-label">群组</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ matchCount }}</text>
        <text class="stat-label">匹配</text>
      </view>
    </view>

    <!-- 相册 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">相册</text>
        <text class="section-more" @click="managePhotos">管理</text>
      </view>
      <view class="photos" v-if="user.photos && user.photos.length">
        <image class="photo" v-for="(p, i) in user.photos" :key="i" :src="p" mode="aspectFill" @click="deletePhoto(i)"></image>
        <view class="photo photo-add" @click="addPhoto">
          <text class="add-icon">+</text>
        </view>
      </view>
      <view class="photos" v-else>
        <view class="photo photo-add" @click="addPhoto">
          <text class="add-icon">+</text>
          <text class="add-text">添加照片</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu">
      <view class="menu-item" @click="editProfile">
        <text>✏️ 编辑资料</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @click="goMyPosts">
        <text>📝 我的动态</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @click="goMyGroups">
        <text>👥 我的群组</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @click="goVip">
        <text>🌟 会员中心</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @click="shareInvite">
        <text>🔗 邀请好友</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @click="goSettings">
        <text>⚙️ 设置</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @click="logout">
        <text style="color:#e74c3c">🚪 退出登录</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/api/request';
export default {
  data() {
    return {
      user: {}, isVip: false, vipDaysLeft: 0,
      postCount: 0, groupCount: 0, matchCount: 0
    };
  },
  computed: {
    genderText() {
      return this.user.gender === 1 ? '男' : this.user.gender === 2 ? '女' : '保密';
    }
  },
  onShow() { this.load(); },
  methods: {
    async load() {
      try {
        this.user = await api.get('/api/v1/user/profile');
        if (this.user.vip_expire_at) {
          const expire = new Date(this.user.vip_expire_at);
          this.isVip = expire > new Date();
          this.vipDaysLeft = this.isVip ? Math.floor((expire - Date.now()) / 86400000) : 0;
        }
      } catch(e) {}
      try {
        const mutuals = await api.get('/api/v1/match/mutual?page=1&limit=1');
        this.matchCount = mutuals.length;
      } catch(e) {}
    },
    editProfile() { uni.navigateTo({ url: '/pages/profile/edit' }); },
    goVip() { uni.navigateTo({ url: '/pages/vip/vip' }); },
    goSettings() { uni.navigateTo({ url: '/pages/profile/settings' }); },
    goMyPosts() { uni.navigateTo({ url: '/pages/profile/my-posts' }); },
    goMyGroups() { uni.switchTab({ url: '/pages/nearby/nearby' }); },
    shareInvite() {
      uni.setClipboardData({
        data: `蜜约App邀请码: ${this.user.invite_code}\n下载: https://meeyou.app`,
        success: () => uni.showToast({ title: '邀请码已复制', icon: 'success' })
      });
    },
    changeAvatar() { uni.showToast({ title: '点击头像可更换', icon: 'none' }); },
    addPhoto() { uni.showToast({ title: '相册管理开发中', icon: 'none' }); },
    deletePhoto(i) { uni.showToast({ title: '长按可删除', icon: 'none' }); },
    managePhotos() { uni.showToast({ title: '相册管理开发中', icon: 'none' }); },
    getAge(y) { return new Date().getFullYear() - y; },
    logout() {
      uni.removeStorageSync('token');
      uni.removeStorageSync('userInfo');
      uni.reLaunch({ url: '/pages/login/login' });
    }
  }
};
</script>

<style scoped>
.user-card { text-align: center; padding: 60rpx 30rpx 40rpx; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; }
.avatar { width: 160rpx; height: 160rpx; border-radius: 50%; border: 4rpx solid rgba(255,255,255,0.5); }
.name { display: block; font-size: 36rpx; font-weight: bold; margin-top: 16rpx; }
.info { display: block; font-size: 24rpx; opacity: 0.8; margin-top: 8rpx; }
.vip-badge { display: inline-block; margin-top: 10rpx; padding: 6rpx 20rpx; background: #ffd700; color: #333; border-radius: 20rpx; font-size: 24rpx; }
.bio { display: block; margin-top: 16rpx; font-size: 26rpx; opacity: 0.9; }

.stats { display: flex; background: #fff; padding: 24rpx 0; margin-top: 16rpx; }
.stat-item { flex: 1; text-align: center; border-right: 1rpx solid #f0f0f0; }
.stat-item:last-child { border: none; }
.stat-num { display: block; font-size: 36rpx; font-weight: bold; color: #667eea; }
.stat-label { display: block; font-size: 24rpx; color: #999; margin-top: 4rpx; }

.section { background: #fff; margin-top: 16rpx; padding: 24rpx 30rpx; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.section-title { font-size: 28rpx; font-weight: bold; }
.section-more { font-size: 24rpx; color: #667eea; }
.photos { display: flex; flex-wrap: wrap; gap: 8rpx; }
.photo { width: calc(33.33% - 6rpx); height: 180rpx; border-radius: 8rpx; }
.photo-add { display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2rpx dashed #e5e5e5; background: #f9f9f9; border-radius: 8rpx; }
.add-icon { font-size: 48rpx; color: #ccc; }
.add-text { font-size: 22rpx; color: #ccc; margin-top: 4rpx; }
.no-data { font-size: 24rpx; color: #999; }

.menu { background: #fff; margin-top: 16rpx; margin-bottom: 40rpx; }
.menu-item { display: flex; justify-content: space-between; align-items: center; padding: 28rpx 30rpx; border-bottom: 1rpx solid #f5f5f5; font-size: 28rpx; }
.arrow { font-size: 32rpx; color: #ccc; }
</style>
