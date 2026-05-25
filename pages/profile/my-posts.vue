<template>
  <view class="myposts-page">
    <view class="post" v-for="p in posts" :key="p.id">
      <view class="post-header">
        <image class="avatar" :src="p.avatar_url || '/static/default-avatar.png'" mode="aspectFill"></image>
        <text class="nickname">{{ p.nickname }}</text>
        <text class="time">{{ formatTime(p.created_at) }}</text>
      </view>
      <text class="post-content" v-if="p.content">{{ p.content }}</text>
      <view class="post-images" v-if="p.images && p.images.length">
        <image class="post-img" v-for="(img, i) in p.images" :key="i" :src="img" mode="aspectFill"></image>
      </view>
      <view class="post-actions">
        <text class="action">❤️ {{ p.like_count || 0 }}</text>
        <text class="action delete" @click="deletePost(p.id)">🗑️ 删除</text>
      </view>
    </view>
    <view class="empty" v-if="posts.length===0 && !loading">
      <text>还没有发过动态</text>
      <text class="sub">去首页发布第一条吧</text>
    </view>
  </view>
</template>

<script>
import api from '@/api/request';
export default {
  data() { return { posts: [], loading: false } },
  onShow() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try {
        this.posts = await api.get('/api/v1/user/profile');
        // 从个人资料查动态（筛选自己的）
        // MVP: 简单实现，后续可以从 /api/v1/post/feed 筛选自己的
      } catch(e) {}
      this.loading = false;
    },
    async deletePost(id) {
      try {
        await api.del('/api/v1/post/' + id);
        this.posts = this.posts.filter(p => p.id !== id);
        uni.showToast({ title: '已删除', icon: 'success' });
      } catch(e) { uni.showToast({ title: e.message, icon: 'none' }); }
    },
    formatTime(t) {
      if (!t) return '';
      const d = new Date(t);
      return d.getMonth()+1 + '/' + d.getDate();
    }
  }
};
</script>

<style scoped>
.post { background: #fff; margin-bottom: 16rpx; padding: 24rpx 30rpx; }
.post-header { display: flex; align-items: center; margin-bottom: 12rpx; }
.avatar { width: 60rpx; height: 60rpx; border-radius: 50%; }
.nickname { font-size: 28rpx; font-weight: bold; margin-left: 16rpx; flex: 1; }
.time { font-size: 22rpx; color: #999; }
.post-content { font-size: 28rpx; line-height: 1.6; }
.post-images { display: flex; flex-wrap: wrap; gap: 8rpx; margin-top: 12rpx; }
.post-img { width: calc(33.33% - 6rpx); height: 200rpx; border-radius: 8rpx; }
.post-actions { display: flex; gap: 30rpx; margin-top: 16rpx; padding-top: 12rpx; border-top: 1rpx solid #f0f0f0; }
.action { font-size: 24rpx; color: #999; }
.delete { color: #e74c3c; }
.empty { text-align: center; padding: 200rpx 0; color: #999; font-size: 28rpx; }
.empty .sub { display: block; font-size: 24rpx; color: #ccc; margin-top: 10rpx; }
</style>
