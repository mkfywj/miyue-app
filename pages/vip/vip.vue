<template>
  <view class="vip-page">
    <view class="plans">
      <view class="plan-card" v-for="p in plans" :key="p.type" @click="selectPlan(p.type)">
        <text class="plan-name">{{ p.name }}</text>
        <text class="plan-price">¥{{ (p.price_cny / 100).toFixed(0) }}</text>
        <text class="plan-original" v-if="p.original">¥{{ p.original }}</text>
      </view>
    </view>

    <view class="benefits">
      <text class="benefit">✅ 无限发送消息</text>
      <text class="benefit">✅ 查看谁喜欢了我</text>
      <text class="benefit">✅ 高级筛选条件</text>
      <text class="benefit">✅ 优先推荐曝光</text>
      <text class="benefit">✅ 去广告</text>
    </view>

    <view class="pay-section" v-if="selectedPlan">
      <text class="pay-title">支付方式</text>
      <view class="pay-options">
        <view class="pay-option" @click="payMethod='usdt'" :class="{active: payMethod==='usdt'}">
          <text>💎 USDT (TRC-20)</text>
        </view>
        <view class="pay-option" @click="payMethod='wechat'" :class="{active: payMethod==='wechat'}">
          <text>💚 微信支付</text>
        </view>
      </view>

      <button class="pay-btn" @click="onPay">立即支付</button>

      <view class="usdt-info" v-if="payMethod==='usdt' && orderNo">
        <text class="usdt-address">收款地址: {{ walletAddress }}</text>
        <text class="usdt-amount">金额: {{ usdtAmount }} USDT</text>
        <text class="usdt-tip">请转账后等待30秒，系统自动到账</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/api/request';
export default {
  data() {
    return {
      plans: [
        { type: 1, name: '月卡', price_cny: 6800 },
        { type: 2, name: '季卡', price_cny: 16800 },
        { type: 3, name: '年卡', price_cny: 36800 }
      ],
      selectedPlan: null,
      payMethod: 'usdt',
      orderNo: null,
      walletAddress: '',
      usdtAmount: 0
    };
  },
  methods: {
    selectPlan(type) {
      this.selectedPlan = type;
      this.orderNo = null;
    },
    async onPay() {
      try {
        const order = await api.post('/api/v1/vip/create_order', { plan_type: this.selectedPlan });
        this.orderNo = order.order_no;
        this.walletAddress = order.wallet_address;
        this.usdtAmount = order.amount_usdt;
        if (this.payMethod === 'usdt') {
          uni.setClipboardData({
            data: order.wallet_address,
            success: () => uni.showToast({ title: '地址已复制，请转账' })
          });
        }
      } catch(e) { uni.showToast({ title: e.message, icon: 'none' }); }
    }
  }
};
</script>

<style scoped>
.vip-page { padding: 30rpx; }
.plans { display: flex; gap: 20rpx; }
.plan-card { flex: 1; background: #fff; border-radius: 16rpx; padding: 40rpx 20rpx; text-align: center; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05); }
.plan-name { display: block; font-size: 28rpx; color: #666; }
.plan-price { display: block; font-size: 48rpx; font-weight: bold; color: #667eea; margin: 16rpx 0; }
.benefits { background: #fff; border-radius: 16rpx; padding: 30rpx; margin-top: 30rpx; }
.benefit { display: block; font-size: 26rpx; padding: 8rpx 0; }
.pay-section { background: #fff; border-radius: 16rpx; padding: 30rpx; margin-top: 30rpx; }
.pay-title { font-size: 28rpx; font-weight: bold; display: block; margin-bottom: 20rpx; }
.pay-options { display: flex; gap: 20rpx; }
.pay-option { flex: 1; height: 80rpx; line-height: 80rpx; text-align: center; border: 2rpx solid #e5e5e5; border-radius: 12rpx; font-size: 26rpx; }
.pay-option.active { border-color: #667eea; background: #f0f2ff; }
.pay-btn { width: 100%; height: 80rpx; line-height: 80rpx; background: linear-gradient(90deg, #667eea, #764ba2); color: #fff; border-radius: 40rpx; font-size: 28rpx; margin-top: 30rpx; }
.usdt-info { margin-top: 20rpx; padding: 20rpx; background: #f9f9f9; border-radius: 12rpx; }
.usdt-address, .usdt-amount, .usdt-tip { display: block; font-size: 24rpx; color: #666; padding: 6rpx 0; }
.usdt-tip { color: #e74c3c; }
</style>
