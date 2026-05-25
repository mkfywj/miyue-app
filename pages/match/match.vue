<template>
  <view class="match-page">
    <view class="tabs">
      <text class="tab" :class="{active: tab===0}" @click="tab=0">匹配 ({{ mutuals.length }})</text>
      <text class="tab" :class="{active: tab===1}" @click="tab=1;loadLikedMe()">喜欢我的 ({{ likedCount }})</text>
    </view>

    <!-- 匹配Tab -->
    <view v-if="tab===0" class="mutual-grid">
      <view class="mutual-card" v-for="m in mutuals" :key="m.match_id" @click="goChat(m)">
        <image class="avatar" :src="m.avatar_url || '/static/default-avatar.png'" mode="aspectFill"></image>
        <text class="name">{{ m.nickname }}</text>
        <text class="unread" v-if="m.unread_count > 0">{{ m.unread_count > 99 ? '99+' : m.unread_count }}</text>
      </view>
      <view class="empty" v-if="mutuals.length===0 && !loading">
        <text>还没有互相喜欢的人</text>
        <text class="empty-sub">去首页多看看哦</text>
      </view>
    </view>

    <!-- 喜欢我的Tab -->
    <view v-if="tab===1" class="liked-list">
      <view class="liked-item" v-for="u in likedMe" :key="u.uid">
        <image class="avatar" :src="u.avatar_url || '/static/default-avatar.png'" mode="aspectFill"></image>
        <view class="info">
          <text class="name">{{ u.nickname }}</text>
          <text class="detail">{{ getAge(u.birth_year) }}岁 · {{ u.city || '未知' }}</text>
        </view>
        <button class="like-back-btn" @click="likeBack(u)">回关</button>
      </view>
      <view class="empty" v-if="likedMe.length===0">暂时没有人喜欢你</view>
    </view>
  </view>
</template>

<script>
import api from '@/api/request';
export default {
  data() {
    return { tab: 0, mutuals: [], likedMe: [], likedCount: 0, loading: false };
  },
  onShow() { this.loadMutuals(); },
  methods: {
    async loadMutuals() {
      this.loading = true;
      try {
        const data = await api.get('/api/v1/match/mutual?page=1&limit=50');
        this.mutuals = data;
      } catch(e) {}
      this.loading = false;
    },
    async loadLikedMe() {
      try {
        const data = await api.get('/api/v1/match/who-liked-me?page=1&limit=50');
        this.likedMe = data;
      } catch(e) {}
    },
    async likeBack(u) {
      try {
        await api.post('/api/v1/match/like', { target_uid: u.uid });
        uni.showToast({ title: '已回关', icon: 'success' });
        this.loadLikedMe();
        this.loadMutuals();
      } catch(e) { uni.showToast({ title: e.message, icon: 'none' }); }
    },
    goChat(m) {
      uni.navigateTo({ url: '/pages/chat/chat?match_id=' + m.match_id + '&uid=' + m.uid + '&nickname=' + m.nickname });
    },
    getAge(y) { return y ? new Date().getFullYear() - y : '?' }
  }
};
</script>

<style scoped>
.tabs { display: flex; background: #fff; padding: 20rpx; }
.tab { flex: 1; text-align: center; font-size: 28rpx; color: #666; padding-bottom: 16rpx; border-bottom: 4rpx solid transparent; }
.tab.active { color: #667eea; border-bottom-color: #667eea; }
.mutual-grid { display: flex; flex-wrap: wrap; padding: 20rpx; gap: 16rpx; }
.mutual-card { width: calc(33.33% - 12rpx); text-align: center; position: relative; }
.avatar { width: 100%; height: 200rpx; border-radius: 16rpx; }
.name { display: block; font-size: 24rpx; margin-top: 8rpx; }
.unread { position: absolute; top: -8rpx; right: -8rpx; background: #e74c3c; color: #fff; font-size: 20rpx; min-width: 36rpx; height: 36rpx; line-height: 36rpx; text-align: center; border-radius: 18rpx; padding: 0 8rpx; }
.liked-list { padding: 20rpx; }
.liked-item { display: flex; align-items: center; background: #fff; padding: 20rpx; border-radius: 16rpx; margin-bottom: 16rpx; }
.liked-item .avatar { width: 100rpx; height: 100rpx; border-radius: 50%; }
.liked-item .info { flex: 1; margin-left: 20rpx; }
.liked-item .name { font-size: 28rpx; font-weight: bold; display: block; }
.liked-item .detail { font-size: 24rpx; color: #999; display: block; margin-top: 4rpx; }
.like-back-btn { height: 56rpx; line-height: 56rpx; padding: 0 30rpx; background: linear-gradient(90deg, #667eea, #764ba2); color: #fff; border-radius: 28rpx; font-size: 24rpx; }
.empty { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
.empty-sub { display: block; font-size: 24rpx; color: #ccc; margin-top: 10rpx; }
</style>
