<template>
  <view class="register-page">
    <view class="form">
      <view class="input-group">
        <text class="label">手机号</text>
        <input class="input" type="text" maxlength="11" placeholder="请输入手机号" v-model="phone" @input="e => phone = e.target.value.replace(/\D/g,'')" />
      </view>
      <view class="input-group">
        <text class="label">密码</text>
        <input class="input" type="password" placeholder="6-32位密码" v-model="password" />
      </view>
      <view class="input-group">
        <text class="label">确认密码</text>
        <input class="input" type="password" placeholder="再次输入密码" v-model="confirmPwd" />
      </view>
      <view class="input-group">
        <text class="label">昵称</text>
        <input class="input" type="text" maxlength="20" placeholder="给自己起个名字" v-model="nickname" />
      </view>
      <view class="input-group">
        <text class="label">性别</text>
        <view class="gender-group">
          <text class="gender-btn" :class="{active: gender===1}" @click="gender=1">男</text>
          <text class="gender-btn" :class="{active: gender===2}" @click="gender=2">女</text>
          <text class="gender-btn" :class="{active: gender===0}" @click="gender=0">保密</text>
        </view>
      </view>
      <view class="input-group">
        <text class="label">邀请码（选填）</text>
        <input class="input" type="text" placeholder="输入邀请码" v-model="inviteCode" />
      </view>
      <button class="btn-primary" @click="onRegister" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>
      <view class="link-area">
        <text class="link" @click="uni.navigateBack()">已有账号？去登录</text>
      </view>
    </view>
    <view class="error" v-if="error">{{ error }}</view>
  </view>
</template>

<script>
import api from '@/api/request';
export default {
  data() {
    return { phone: '', password: '', confirmPwd: '', nickname: '', gender: 0, inviteCode: '', loading: false, error: '' }
  },
  methods: {
    async onRegister() {
      if (!this.phone || this.phone.length < 11) { this.error = '请输入正确的手机号'; return; }
      if (!this.password || this.password.length < 6) { this.error = '密码至少6位'; return; }
      if (this.password !== this.confirmPwd) { this.error = '两次密码不一致'; return; }
      this.loading = true; this.error = '';
      try {
        const data = await api.post('/api/v1/auth/register', {
          phone: this.phone, password: this.password,
          nickname: this.nickname, gender: this.gender,
          invite_code: this.inviteCode
        });
        uni.setStorageSync('token', data.token);
        uni.setStorageSync('userInfo', data.user);
        uni.switchTab({ url: '/pages/index/index' });
      } catch(e) { this.error = e.message; }
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.register-page { padding: 40rpx 60rpx; background: #fff; min-height: 100vh; }
.input-group { margin-bottom: 32rpx; }
.label { display: block; font-size: 26rpx; color: #333; margin-bottom: 12rpx; }
.input { border: 2rpx solid #e5e5e5; border-radius: 12rpx; padding: 20rpx 24rpx; font-size: 28rpx; width: 100%; box-sizing: border-box; }
.gender-group { display: flex; gap: 20rpx; }
.gender-btn { flex: 1; height: 72rpx; line-height: 72rpx; text-align: center; border: 2rpx solid #e5e5e5; border-radius: 12rpx; font-size: 28rpx; color: #666; }
.gender-btn.active { border-color: #667eea; color: #667eea; background: #f0f2ff; }
.btn-primary { width: 100%; height: 88rpx; line-height: 88rpx; background: linear-gradient(90deg, #667eea, #764ba2); color: #fff; border-radius: 44rpx; font-size: 32rpx; margin-top: 40rpx; text-align: center; }
.link-area { text-align: center; margin-top: 30rpx; }
.link { font-size: 26rpx; color: #667eea; }
.error { position: fixed; bottom: 60rpx; left: 60rpx; right: 60rpx; text-align: center; color: #e74c3c; font-size: 26rpx; }
</style>
