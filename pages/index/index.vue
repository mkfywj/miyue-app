<template>
  <view class="index-page">
    <!-- 顶部筛选栏 -->
    <view class="header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <view class="filters">
        <picker @change="onGenderFilter" :range="['全部', '男', '女']">
          <text class="filter-btn">{{ genderFilterText }}</text>
        </picker>
      </view>
    </view>

    <!-- 卡片区域 -->
    <view class="card-area">
      <view v-if="users.length === 0 && !loading" class="empty">
        <text class="empty-icon">😅</text>
        <text class="empty-text">附近暂无更多用户</text>
        <text class="empty-sub">稍后再来看看吧</text>
      </view>

      <!-- 用户卡片 -->
      <view class="card-stack">
        <view
          v-for="(user, idx) in visibleCards"
          :key="user.uid"
          class="card"
          :class="{ 'card-top': idx === 0 }"
          :style="{ zIndex: cards.length - idx }"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <image class="card-img" :src="user.avatar_url || '/static/default-avatar.png'" mode="aspectFill"></image>
          <view class="card-info">
            <text class="card-name">{{ user.nickname }}</text>
            <text class="card-age">{{ user.birth_year ? getAge(user.birth_year) + '岁' : '' }}</text>
            <text class="card-city">{{ user.city || '' }}</text>
          </view>
          <view class="card-bio" v-if="user.bio">{{ user.bio }}</view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="actions" v-if="users.length > 0">
      <view class="action-btn pass-btn" @click="onPass">
        <text class="action-icon">✕</text>
      </view>
      <view class="action-btn like-btn" @click="onLike">
        <text class="action-icon">♥</text>
      </view>
    </view>

    <!-- 互配弹窗 -->
    <view class="match-modal" v-if="showMatch">
      <view class="match-content">
        <text class="match-title">❤️ 互相喜欢 ❤️</text>
        <text class="match-sub">你们可以开始聊天了！</text>
        <button class="match-btn" @click="goToChat">开始聊天</button>
        <button class="match-btn match-btn-light" @click="showMatch=false">继续浏览</button>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/api/request';

export default {
  data() {
    return {
      users: [],
      currentIndex: 0,
      loading: false,
      genderFilter: 0, // 0全部 1男 2女
      showMatch: false,
      matchUser: null,
      startX: 0,
      startY: 0,
      offsetX: 0
    };
  },
  computed: {
    cards() { return this.users.slice(this.currentIndex); },
    visibleCards() { return this.cards.slice(0, 3); },
    genderFilterText() { return ['全部', '男', '女'][this.genderFilter]; }
  },
  onShow() {
    if (!uni.getStorageSync('token')) {
      uni.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.loadUsers();
  },
  methods: {
    async loadUsers() {
      this.loading = true;
      try {
        const data = await api.get('/api/v1/match/nearby?page=1&limit=20&gender=' + this.genderFilter);
        this.users = data;
        this.currentIndex = 0;
      } catch(e) {
        uni.showToast({ title: e.message, icon: 'none' });
      }
      this.loading = false;
    },
    onGenderFilter(e) {
      this.genderFilter = e.detail.value;
      this.loadUsers();
    },
    async onLike() {
      if (this.cards.length === 0) return;
      const user = this.cards[0];
      try {
        const result = await api.post('/api/v1/match/like', { target_uid: user.uid });
        this.currentIndex++;
        if (result && result.is_match) {
          this.matchUser = user;
          this.showMatch = true;
        }
      } catch(e) {
        uni.showToast({ title: e.message, icon: 'none' });
      }
    },
    async onPass() {
      if (this.cards.length === 0) return;
      const user = this.cards[0];
      try {
        await api.post('/api/v1/match/pass', { target_uid: user.uid });
        this.currentIndex++;
      } catch(e) {
        uni.showToast({ title: e.message, icon: 'none' });
      }
    },
    onTouchStart(e) {
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
    },
    onTouchMove(e) {
      this.offsetX = e.touches[0].clientX - this.startX;
    },
    onTouchEnd() {
      const threshold = 80;
      if (this.offsetX > threshold) this.onLike();
      else if (this.offsetX < -threshold) this.onPass();
      this.offsetX = 0;
    },
    getAge(year) { return new Date().getFullYear() - year; },
    goToChat() {
      this.showMatch = false;
      uni.switchTab({ url: '/pages/match/match' });
    }
  }
};
</script>

<style scoped>
.index-page { background: #f5f5f5; height: 100vh; display: flex; flex-direction: column; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 30rpx; background: #fff; }
.logo { height: 60rpx; }
.filter-btn { font-size: 26rpx; color: #666; padding: 10rpx 24rpx; border: 2rpx solid #e5e5e5; border-radius: 30rpx; }
.card-area { flex: 1; display: flex; align-items: center; justify-content: center; padding: 20rpx; }
.card-stack { width: 100%; height: 70vh; position: relative; }
.card { position: absolute; width: 100%; height: 100%; border-radius: 24rpx; overflow: hidden; background: #fff; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1); }
.card-top { }
.card-img { width: 100%; height: 75%; }
.card-info { position: absolute; bottom: 80rpx; left: 30rpx; display: flex; align-items: baseline; gap: 12rpx; }
.card-name { font-size: 36rpx; font-weight: bold; color: #fff; text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.3); }
.card-age { font-size: 28rpx; color: #fff; text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.3); }
.card-city { font-size: 26rpx; color: #fff; text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.3); }
.card-bio { position: absolute; bottom: 20rpx; left: 30rpx; font-size: 24rpx; color: rgba(255,255,255,0.8); }
.empty { text-align: center; }
.empty-icon { font-size: 80rpx; }
.empty-text { display: block; font-size: 32rpx; color: #666; margin-top: 20rpx; }
.empty-sub { display: block; font-size: 26rpx; color: #999; margin-top: 10rpx; }
.actions { display: flex; justify-content: center; gap: 60rpx; padding: 30rpx 0 60rpx; background: #fff; }
.action-btn { width: 100rpx; height: 100rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1); }
.pass-btn { background: #fff; border: 2rpx solid #ff6b6b; }
.pass-btn .action-icon { color: #ff6b6b; font-size: 40rpx; }
.like-btn { background: linear-gradient(135deg, #667eea, #764ba2); }
.like-btn .action-icon { color: #fff; font-size: 40rpx; }
.match-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.match-content { background: #fff; border-radius: 24rpx; padding: 60rpx 80rpx; text-align: center; width: 70%; }
.match-title { font-size: 40rpx; font-weight: bold; color: #e74c3c; }
.match-sub { font-size: 28rpx; color: #666; margin: 20rpx 0 40rpx; }
.match-btn { width: 100%; height: 80rpx; line-height: 80rpx; background: linear-gradient(90deg, #667eea, #764ba2); color: #fff; border-radius: 40rpx; font-size: 28rpx; margin-top: 20rpx; }
.match-btn-light { background: #f5f5f5; color: #666; }
</style>
