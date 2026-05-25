<template>
  <view class="conversations-page">
    <view class="list">
      <view class="conv-item" v-for="c in conversations" :key="c.match_id" @click="goChat(c)">
        <image class="avatar" :src="c.avatar_url || '/static/default-avatar.png'" mode="aspectFill"></image>
        <view class="info">
          <view class="top">
            <text class="name">{{ c.nickname }}</text>
            <text class="time">{{ formatTime(c.last_time) }}</text>
          </view>
          <view class="bottom">
            <text class="last-msg">{{ c.last_message || '开始聊天吧' }}</text>
            <text class="unread" v-if="c.unread > 0">{{ c.unread > 99 ? '99+' : c.unread }}</text>
          </view>
        </view>
      </view>
      <view class="empty" v-if="conversations.length===0">
        <text>暂无聊天</text>
        <text class="sub">匹配成功后可以开始聊天</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/api/request';
export default {
  data() { return { conversations: [] } },
  onShow() { this.load(); },
  methods: {
    async load() {
      try { this.conversations = await api.get('/api/v1/message/conversations?page=1&limit=50'); }
      catch(e) {}
    },
    goChat(c) {
      uni.navigateTo({ url: `/pages/chat/chat?match_id=${c.match_id}&uid=${c.peer_uid}&nickname=${c.nickname}` });
    },
    formatTime(t) {
      if (!t) return '';
      const d = new Date(t);
      const now = new Date();
      if (d.toDateString() === now.toDateString()) return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
      return (d.getMonth()+1) + '/' + d.getDate();
    }
  }
};
</script>

<style scoped>
.conv-item { display: flex; align-items: center; padding: 24rpx 30rpx; background: #fff; border-bottom: 1rpx solid #f5f5f5; }
.avatar { width: 100rpx; height: 100rpx; border-radius: 50%; }
.info { flex: 1; margin-left: 20rpx; }
.top { display: flex; justify-content: space-between; align-items: center; }
.name { font-size: 28rpx; font-weight: bold; }
.time { font-size: 22rpx; color: #999; }
.bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 8rpx; }
.last-msg { font-size: 24rpx; color: #999; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 400rpx; }
.unread { background: #e74c3c; color: #fff; font-size: 20rpx; min-width: 36rpx; height: 36rpx; line-height: 36rpx; text-align: center; border-radius: 18rpx; padding: 0 8rpx; }
.empty { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
.empty .sub { display: block; font-size: 24rpx; color: #ccc; margin-top: 10rpx; }
</style>
