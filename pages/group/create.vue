<template>
  <view class="create-page">
    <view class="form">
      <view class="field">
        <text class="label">群名称 *</text>
        <input class="input" v-model="name" maxlength="50" placeholder="给群取个名字" />
      </view>
      <view class="field">
        <text class="label">群分类</text>
        <picker @change="onCategory" :range="categories">
          <text class="picker-text">{{ category || '选择分类' }}</text>
        </picker>
      </view>
      <view class="field">
        <text class="label">城市</text>
        <input class="input" v-model="city" maxlength="20" placeholder="城市（选填）" />
      </view>
      <view class="field">
        <text class="label">群简介</text>
        <textarea class="textarea" v-model="description" maxlength="200" placeholder="写一段群介绍" />
      </view>
      <view class="field">
        <text class="label">加群方式</text>
        <view class="gender-group">
          <text class="gender-btn" :class="{active: needApprove}" @click="needApprove=true">需要审核</text>
          <text class="gender-btn" :class="{active: !needApprove}" @click="needApprove=false">直接加入</text>
        </view>
      </view>
      <view class="field">
        <text class="label">最大人数</text>
        <picker @change="onMaxMembers" :range="[50,100,200,500]">
          <text class="picker-text">{{ maxMembers }}人</text>
        </picker>
      </view>
      <button class="create-btn" @click="onCreate" :disabled="loading">
        {{ loading ? '创建中...' : '创建群组' }}
      </button>
    </view>
  </view>
</template>

<script>
import api from '@/api/request';
export default {
  data() {
    return {
      name: '', description: '', category: '', city: '',
      needApprove: true, maxMembers: 100,
      categories: ['换妻', '同城', '兴趣', '单身', '夫妻', '交友', '聊天'],
      loading: false
    };
  },
  methods: {
    onCategory(e) { this.category = this.categories[e.detail.value]; },
    onMaxMembers(e) { this.maxMembers = [50,100,200,500][e.detail.value]; },
    async onCreate() {
      if (!this.name) { uni.showToast({ title: '请输入群名称', icon: 'none' }); return; }
      this.loading = true;
      try {
        const data = await api.post('/api/v1/group/create', {
          name: this.name, description: this.description,
          category: this.category, city: this.city,
          max_members: this.maxMembers, need_approve: this.needApprove
        });
        uni.showToast({ title: '创建成功！', icon: 'success' });
        uni.navigateTo({ url: '/pages/group/detail?id=' + data.id });
      } catch(e) { uni.showToast({ title: e.message, icon: 'none' }); }
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.create-page { padding: 30rpx; }
.field { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx; }
.label { font-size: 26rpx; color: #666; display: block; margin-bottom: 12rpx; }
.input { width: 100%; font-size: 28rpx; border: none; outline: none; }
.textarea { width: 100%; font-size: 28rpx; border: none; outline: none; min-height: 100rpx; }
.picker-text { font-size: 28rpx; color: #333; }
.gender-group { display: flex; gap: 16rpx; }
.gender-btn { flex: 1; height: 64rpx; line-height: 64rpx; text-align: center; border: 2rpx solid #e5e5e5; border-radius: 12rpx; font-size: 26rpx; color: #666; }
.gender-btn.active { border-color: #667eea; color: #667eea; background: #f0f2ff; }
.create-btn { width: 100%; height: 88rpx; line-height: 88rpx; background: linear-gradient(90deg, #667eea, #764ba2); color: #fff; border-radius: 44rpx; font-size: 32rpx; margin-top: 40rpx; }
.create-btn[disabled] { opacity: 0.6; }
</style>
