<template>
  <view class="nearby-page">
    <view class="header">
      <text class="title">附近的人</text>
    </view>
    <view class="user-grid">
      <view class="user-card" v-for="user in users" :key="user.uid">
        <image class="avatar" :src="user.avatar_url || '/static/default-avatar.png'" mode="aspectFill"></image>
        <text class="nickname">{{ user.nickname }}</text>
        <text class="info">{{ getAge(user.birth_year) }}岁 · {{ user.city || '未知' }}</text>
      </view>
    </view>
    <view class="loading" v-if="loading">加载中...</view>
  </view>
</template>

<script>
import api from '@/api/request';
export default {
  data() { return { users: [], loading: false, page: 1 } },
  onShow() { this.loadUsers(); },
  onReachBottom() { this.loadUsers(); },
  methods: {
    async loadUsers() {
      this.loading = true;
      try {
        const data = await api.get('/api/v1/match/nearby?page=' + this.page + '&limit=20');
        this.users = [...this.users, ...data];
        this.page++;
      } catch(e) { uni.showToast({ title: e.message, icon: 'none' }); }
      this.loading = false;
    },
    getAge(y) { return y ? new Date().getFullYear() - y : '?' }
  }
};
</script>

<style scoped>
.header { padding: 20rpx 30rpx; background: #fff; }
.title { font-size: 32rpx; font-weight: bold; }
.user-grid { display: flex; flex-wrap: wrap; padding: 20rpx; gap: 16rpx; }
.user-card { width: calc(50% - 8rpx); background: #fff; border-radius: 16rpx; overflow: hidden; padding-bottom: 16rpx; }
.avatar { width: 100%; height: 360rpx; }
.nickname { display: block; font-size: 28rpx; font-weight: bold; padding: 10rpx 16rpx 0; }
.info { display: block; font-size: 24rpx; color: #999; padding: 4rpx 16rpx 0; }
.loading { text-align: center; padding: 20rpx; color: #999; font-size: 26rpx; }
</style>
