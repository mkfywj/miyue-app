<template>
  <view class="discover-page">
    <!-- 分类筛选 -->
    <view class="categories">
      <scroll-view scroll-x class="cat-scroll">
        <view class="cat-list">
          <text class="cat-item" :class="{active: currentCat===''}" @click="currentCat='';load()">全部</text>
          <text class="cat-item" :class="{active: currentCat==='换妻'}" @click="currentCat='换妻';load()">换妻</text>
          <text class="cat-item" :class="{active: currentCat==='同城'}" @click="currentCat='同城';load()">同城</text>
          <text class="cat-item" :class="{active: currentCat==='兴趣'}" @click="currentCat='兴趣';load()">兴趣</text>
          <text class="cat-item" :class="{active: currentCat==='单身'}" @click="currentCat='单身';load()">单身</text>
          <text class="cat-item" :class="{active: currentCat==='夫妻'}" @click="currentCat='夫妻';load()">夫妻</text>
        </view>
      </scroll-view>
    </view>

    <!-- 群组列表 -->
    <view class="group-list">
      <view class="group-card" v-for="g in groups" :key="g.id" @click="goDetail(g.id)">
        <image class="cover" :src="g.cover_url || '/static/default-group.png'" mode="aspectFill"></image>
        <view class="info">
          <text class="name">{{ g.name }}</text>
          <text class="desc" v-if="g.description">{{ g.description }}</text>
          <view class="meta">
            <text class="meta-item">{{ g.category || '综合' }}</text>
            <text class="meta-item">{{ g.city || '全国' }}</text>
            <text class="meta-item">{{ g.member_count || 0 }}人</text>
            <text class="meta-item tag" v-if="g.my_status === 1">已加入</text>
            <text class="meta-item tag pending" v-else-if="g.my_status === 0">待审核</text>
          </view>
        </view>
      </view>
    </view>

    <view class="empty" v-if="groups.length===0 && !loading">
      <text>暂无群组</text>
      <text class="sub">创建一个新的群组吧</text>
    </view>

    <view class="fab" @click="goCreate">
      <text class="fab-icon">＋</text>
    </view>
  </view>
</template>

<script>
import api from '@/api/request';
export default {
  data() { return { groups: [], currentCat: '', loading: false } },
  onShow() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try {
        this.groups = await api.get('/api/v1/group/list?page=1&limit=50&category=' + this.currentCat);
      } catch(e) { uni.showToast({ title: e.message, icon: 'none' }); }
      this.loading = false;
    },
    goDetail(id) { uni.navigateTo({ url: '/pages/group/detail?id=' + id }); },
    goCreate() { uni.navigateTo({ url: '/pages/group/create' }); }
  }
};
</script>

<style scoped>
.categories { background: #fff; padding: 16rpx 0; border-bottom: 1rpx solid #f0f0f0; }
.cat-scroll { white-space: nowrap; }
.cat-list { display: flex; padding: 0 20rpx; gap: 16rpx; }
.cat-item { display: inline-block; padding: 8rpx 28rpx; font-size: 26rpx; color: #666; border-radius: 30rpx; background: #f5f5f5; }
.cat-item.active { background: #667eea; color: #fff; }
.group-list { padding: 20rpx; }
.group-card { display: flex; background: #fff; border-radius: 16rpx; overflow: hidden; margin-bottom: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05); }
.cover { width: 200rpx; height: 200rpx; flex-shrink: 0; }
.info { flex: 1; padding: 20rpx; display: flex; flex-direction: column; justify-content: center; }
.name { font-size: 30rpx; font-weight: bold; }
.desc { font-size: 24rpx; color: #999; margin-top: 8rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.meta { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 12rpx; }
.meta-item { font-size: 22rpx; color: #999; background: #f5f5f5; padding: 4rpx 16rpx; border-radius: 20rpx; }
.tag { background: #e8f5e9; color: #4caf50; }
.pending { background: #fff3e0; color: #ff9800; }
.empty { text-align: center; padding: 200rpx 0; color: #999; font-size: 28rpx; }
.empty .sub { display: block; font-size: 24rpx; color: #ccc; margin-top: 10rpx; }
.fab { position: fixed; right: 40rpx; bottom: 120rpx; width: 100rpx; height: 100rpx; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4rpx 20rpx rgba(102,126,234,0.4); z-index: 100; }
.fab-icon { font-size: 48rpx; color: #fff; }
</style>
