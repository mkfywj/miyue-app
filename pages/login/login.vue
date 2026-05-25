<template>
  <view class="login-page">
    <view class="logo-area">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="slogan">遇见志同道合的人</text>
    </view>

    <view class="form">
      <view class="input-group">
        <text class="label">手机号</text>
        <view class="input-wrap">
          <text class="prefix">+86</text>
          <input class="input" type="text" maxlength="11" placeholder="请输入手机号" v-model="phone" @input="onPhoneInput" />
        </view>
      </view>

      <view class="input-group">
        <text class="label">密码</text>
        <view class="input-wrap">
          <input class="input" type="password" placeholder="请输入密码" v-model="password" />
        </view>
      </view>

      <button class="btn-primary" @click="onLogin" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <view class="links">
        <text class="link" @click="toRegister">没有账号？去注册</text>
      </view>
    </view>

    <view class="error" v-if="error">{{ error }}</view>
  </view>
</template>

<script>
import api from '@/api/request';

export default {
  data() {
    return {
      phone: '',
      password: '',
      loading: false,
      error: ''
    };
  },
  methods: {
    onPhoneInput(e) {
      this.phone = e.target.value.replace(/\D/g, '');
    },
    async onLogin() {
      if (!this.phone || this.phone.length < 11) {
        this.error = '请输入正确的手机号';
        return;
      }
      if (!this.password) {
        this.error = '请输入密码';
        return;
      }

      this.loading = true;
      this.error = '';

      try {
        const data = await api.post('/api/v1/auth/login', {
          phone: this.phone,
          password: this.password
        });
        uni.setStorageSync('token', data.token);
        uni.setStorageSync('userInfo', data.user);
        uni.switchTab({ url: '/pages/index/index' });
      } catch (e) {
        this.error = e.message;
      }

      this.loading = false;
    },
    toRegister() {
      uni.navigateTo({ url: '/pages/login/register' });
    }
  }
};
</script>

<style scoped>
.login-page { padding: 80rpx 60rpx 0; background: #fff; min-height: 100vh; }
.logo-area { text-align: center; margin-bottom: 80rpx; }
.logo { width: 160rpx; height: 160rpx; border-radius: 40rpx; }
.slogan { display: block; margin-top: 20rpx; font-size: 28rpx; color: #999; }
.form { }
.input-group { margin-bottom: 40rpx; }
.label { display: block; font-size: 28rpx; color: #333; margin-bottom: 16rpx; }
.input-wrap { display: flex; align-items: center; border: 2rpx solid #e5e5e5; border-radius: 16rpx; padding: 20rpx 24rpx; }
.prefix { font-size: 28rpx; color: #666; margin-right: 16rpx; padding-right: 16rpx; border-right: 2rpx solid #e5e5e5; }
.input { flex: 1; font-size: 28rpx; }
.btn-primary { width: 100%; height: 88rpx; line-height: 88rpx; background: linear-gradient(90deg, #667eea, #764ba2); color: #fff; border-radius: 44rpx; font-size: 32rpx; margin-top: 60rpx; text-align: center; }
.btn-primary[disabled] { opacity: 0.6; }
.links { text-align: center; margin-top: 40rpx; }
.link { font-size: 26rpx; color: #667eea; }
.error { position: fixed; bottom: 100rpx; left: 60rpx; right: 60rpx; text-align: center; color: #e74c3c; font-size: 26rpx; }
</style>
