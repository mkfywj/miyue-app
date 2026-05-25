<template>
  <view class="edit-page">
    <!-- 头像 -->
    <view class="avatar-section" @click="changeAvatar">
      <image class="avatar" :src="form.avatar_url || '/static/default-avatar.png'" mode="aspectFill"></image>
      <text class="change-avatar">点击更换头像</text>
    </view>

    <view class="form">
      <view class="field">
        <text class="label">昵称</text>
        <input class="input" v-model="form.nickname" maxlength="20" placeholder="给自己起个名字" />
      </view>
      <view class="field">
        <text class="label">性别</text>
        <view class="gender-group">
          <text class="gender-btn" :class="{active: form.gender===1}" @click="form.gender=1">男</text>
          <text class="gender-btn" :class="{active: form.gender===2}" @click="form.gender=2">女</text>
          <text class="gender-btn" :class="{active: form.gender===0}" @click="form.gender=0">保密</text>
        </view>
      </view>
      <view class="field">
        <text class="label">出生年份</text>
        <picker mode="date" :value="yearStr" :start="startYear" :end="endYear" fields="year" @change="onYearChange">
          <text class="picker-text">{{ form.birth_year || '选择年份' }}</text>
        </picker>
      </view>
      <view class="field">
        <text class="label">城市</text>
        <input class="input" v-model="form.city" maxlength="20" placeholder="你的城市" />
      </view>
      <view class="field">
        <text class="label">个人简介</text>
        <textarea class="textarea" v-model="form.bio" maxlength="200" placeholder="写一段介绍，让大家认识你" />
        <text class="count">{{ (form.bio||'').length }}/200</text>
      </view>
      <view class="field">
        <text class="label">角色</text>
        <view class="gender-group">
          <text class="gender-btn" :class="{active: form.role===0}" @click="form.role=0">单人</text>
          <text class="gender-btn" :class="{active: form.role===1}" @click="form.role=1">夫妻</text>
        </view>
      </view>
    </view>

    <button class="save-btn" @click="onSave" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
  </view>
</template>

<script>
import api from '@/api/request';
export default {
  data() {
    const year = new Date().getFullYear();
    return {
      form: { nickname: '', gender: 0, birth_year: 0, city: '', bio: '', avatar_url: '', role: 0 },
      saving: false,
      startYear: String(year - 60),
      endYear: String(year - 18)
    };
  },
  computed: { yearStr() { return this.form.birth_year ? String(this.form.birth_year) + '-01-01' : ''; } },
  onShow() { this.load(); },
  methods: {
    async load() {
      try {
        const data = await api.get('/api/v1/user/profile');
        this.form = { nickname: data.nickname, gender: data.gender, birth_year: data.birth_year, city: data.city, bio: data.bio, avatar_url: data.avatar_url, role: data.role };
      } catch(e) { uni.showToast({ title: '加载失败', icon: 'none' }); }
    },
    onYearChange(e) { this.form.birth_year = parseInt(e.detail.value.split('-')[0]); },
    async changeAvatar() {
      uni.chooseImage({ count: 1, success: async (res) => {
        try {
          const data = await api.upload('/api/v1/user/avatar', res.tempFilePaths[0]);
          this.form.avatar_url = data.url;
        } catch(e) { uni.showToast({ title: '上传失败', icon: 'none' }); }
      }});
    },
    async onSave() {
      if (!this.form.nickname) { uni.showToast({ title: '请输入昵称', icon: 'none' }); return; }
      this.saving = true;
      try {
        await api.put('/api/v1/user/profile', {
          nickname: this.form.nickname, gender: this.form.gender,
          birth_year: this.form.birth_year, city: this.form.city,
          bio: this.form.bio, role: this.form.role
        });
        uni.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(() => uni.navigateBack(), 800);
      } catch(e) { uni.showToast({ title: e.message, icon: 'none' }); }
      this.saving = false;
    }
  }
};
</script>

<style scoped>
.edit-page { padding: 30rpx; }
.avatar-section { text-align: center; padding: 40rpx 0; }
.avatar { width: 160rpx; height: 160rpx; border-radius: 50%; }
.change-avatar { display: block; font-size: 24rpx; color: #667eea; margin-top: 12rpx; }
.field { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx; }
.label { font-size: 26rpx; color: #666; display: block; margin-bottom: 12rpx; }
.input { width: 100%; font-size: 28rpx; border: none; outline: none; }
.textarea { width: 100%; font-size: 28rpx; border: none; outline: none; min-height: 120rpx; }
.count { display: block; text-align: right; font-size: 22rpx; color: #ccc; margin-top: 8rpx; }
.gender-group { display: flex; gap: 16rpx; }
.gender-btn { flex: 1; height: 64rpx; line-height: 64rpx; text-align: center; border: 2rpx solid #e5e5e5; border-radius: 12rpx; font-size: 26rpx; color: #666; }
.gender-btn.active { border-color: #667eea; color: #667eea; background: #f0f2ff; }
.picker-text { font-size: 28rpx; color: #333; }
.save-btn { width: 100%; height: 88rpx; line-height: 88rpx; background: linear-gradient(90deg, #667eea, #764ba2); color: #fff; border-radius: 44rpx; font-size: 32rpx; margin-top: 40rpx; }
.save-btn[disabled] { opacity: 0.6; }
</style>
