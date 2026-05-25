<template>
  <view>
    <tab-bar v-if="isLoggedIn" />
    <page v-for="item in pages" :key="item.path" :is="item.path.split('/').pop()" />
  </view>
</template>

<script>
export default {
  data() {
    return { isLoggedIn: false }
  },
  onLaunch() {
    const token = uni.getStorageSync('token');
    if (token) {
      this.isLoggedIn = true;
      uni.switchTab({ url: '/pages/index/index' });
    }
  }
}
</script>

<style>
page { background-color: #F5F5F5; }
</style>
