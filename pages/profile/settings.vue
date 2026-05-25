<template>
  <view class="settings-page">
    <view class="group">
      <view class="group-title">账号</view>
      <view class="item" @click="changePassword">
        <text class="label">修改密码</text>
        <text class="arrow">›</text>
      </view>
      <view class="item">
        <text class="label">绑定手机</text>
        <text class="value">{{ user.phone || '未绑定' }}</text>
      </view>
    </view>

    <view class="group">
      <view class="group-title">通知</view>
      <view class="item">
        <text class="label">消息通知</text>
        <switch class="switch" :checked="notifyMsg" @change="notifyMsg=$event.detail.value" />
      </view>
      <view class="item">
        <text class="label">匹配通知</text>
        <switch class="switch" :checked="notifyMatch" @change="notifyMatch=$event.detail.value" />
      </view>
      <view class="item">
        <text class="label">动态通知</text>
        <switch class="switch" :checked="notifyPost" @change="notifyPost=$event.detail.value" />
      </view>
    </view>

    <view class="group">
      <view class="group-title">隐私</view>
      <view class="item">
        <text class="label">在线状态</text>
        <switch class="switch" :checked="showOnline" @change="showOnline=$event.detail.value" />
      </view>
      <view class="item">
        <text class="label">距离可见</text>
        <switch class="switch" :checked="showDistance" @change="showDistance=$event.detail.value" />
      </view>
    </view>

    <view class="group">
      <view class="group-title">关于</view>
      <view class="item">
        <text class="label">版本号</text>
        <text class="value">v1.0.0</text>
      </view>
      <view class="item" @click="showAgreement">
        <text class="label">用户协议</text>
        <text class="arrow">›</text>
      </view>
      <view class="item" @click="showPrivacy">
        <text class="label">隐私政策</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <view class="clear-cache" @click="clearCache">
      <text>清除缓存</text>
    </view>
  </view>
</template>

<script>
import api from '@/api/request';
export default {
  data() {
    return {
      user: {},
      notifyMsg: true, notifyMatch: true, notifyPost: false,
      showOnline: true, showDistance: true
    };
  },
  onShow() { this.load(); },
  methods: {
    async load() {
      try {
        this.user = await api.get('/api/v1/user/profile');
      } catch(e) {}
    },
    changePassword() { uni.showToast({ title: '功能开发中', icon: 'none' }); },
    showAgreement() { uni.showToast({ title: '用户协议（待添加）', icon: 'none' }); },
    showPrivacy() { uni.showToast({ title: '隐私政策（待添加）', icon: 'none' }); },
    clearCache() {
      uni.showToast({ title: '缓存已清除', icon: 'success' });
    }
  }
};
</script>

<style scoped>
.settings-page { padding-bottom: 40rpx; }
.group { background: #fff; margin-top: 16rpx; }
.group-title { font-size: 24rpx; color: #999; padding: 24rpx 30rpx 12rpx; }
.item { display: flex; justify-content: space-between; align-items: center; padding: 28rpx 30rpx; border-bottom: 1rpx solid #f5f5f5; }
.label { font-size: 28rpx; color: #333; }
.value { font-size: 26rpx; color: #999; }
.arrow { font-size: 32rpx; color: #ccc; }
.switch { transform: scale(0.8); }
.clear-cache { text-align: center; padding: 40rpx; }
.clear-cache text { font-size: 26rpx; color: #999; }
</style>
