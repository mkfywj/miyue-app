<template>
  <view class="chat-page">
    <!-- 消息列表 -->
    <scroll-view class="msg-list" scroll-y :scroll-top="scrollTop" @scrolltoupper="loadMore" upper-threshold="100">
      <view class="msg" v-for="m in messages" :key="m.id" :class="m.from_uid === myUid ? 'my' : 'other'">
        <image class="msg-avatar" :src="m.from_uid === myUid ? myAvatar : peerAvatar" mode="aspectFill"></image>
        <view class="bubble" :class="m.msg_type === 1 ? 'image-bubble' : ''">
          <image v-if="m.msg_type === 1" :src="m.content" mode="widthFix" style="max-width: 300rpx; border-radius: 12rpx;"></image>
          <text v-else>{{ m.content }}</text>
        </view>
      </view>
      <view class="loading-msg" v-if="loadingMore">加载中...</view>
    </scroll-view>

    <!-- 输入区 -->
    <view class="input-area">
      <button class="img-btn" @click="sendImage">📷</button>
      <input class="input" v-model="text" placeholder="输入消息..." @confirm="sendText" confirm-type="send" />
      <button class="send-btn" @click="sendText" :disabled="!text.trim()">发送</button>
    </view>

    <!-- VIP提示 -->
    <view class="vip-tip" v-if="showVipTip">
      <text>开通会员即可发送消息</text>
      <text class="vip-link" @click="goVip">去开通</text>
    </view>
  </view>
</template>

<script>
import api from '@/api/request';

export default {
  data() {
    return {
      match_id: '',
      peerUid: '',
      peerNickname: '',
      peerAvatar: '',
      messages: [],
      text: '',
      myUid: '',
      myAvatar: '',
      ws: null,
      scrollTop: 999999,
      loadingMore: false,
      hasMore: true,
      showVipTip: false
    };
  },
  onLoad(params) {
    this.match_id = params.match_id;
    this.peerUid = params.uid;
    this.peerNickname = params.nickname || '';
    uni.setNavigationBarTitle({ title: this.peerNickname });

    const userInfo = uni.getStorageSync('userInfo');
    this.myUid = userInfo ? userInfo.uid : '';
    this.myAvatar = userInfo ? userInfo.avatar_url : '';

    this.loadMessages();
    this.connectWS();
  },
  onUnload() { if (this.ws) this.ws.close(); },
  methods: {
    async loadMessages(beforeId) {
      try {
        let url = `/api/v1/message/${this.match_id}?limit=30`;
        if (beforeId) url += '&before_id=' + beforeId;
        const data = await api.get(url);
        if (data.length < 30) this.hasMore = false;
        if (beforeId) {
          this.messages = [...data, ...this.messages];
        } else {
          this.messages = data;
          this.scrollToBottom();
        }
      } catch(e) {}
    },
    loadMore() {
      if (!this.hasMore || this.loadingMore || this.messages.length === 0) return;
      this.loadingMore = true;
      this.loadMessages(this.messages[0].id).then(() => { this.loadingMore = false; });
    },
    connectWS() {
      const token = uni.getStorageSync('token');
      if (!token) return;
      const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
	  const wsHost = location.host;
	  const wsUrl = wsProtocol + "//" + wsHost + "/ws?token=" + token;
      this.ws = uni.connectSocket({ url: wsUrl });
      this.ws.onMessage((res) => {
        try {
          const msg = JSON.parse(res.data);
          if (msg.type === 'new_message' && msg.data.match_id == this.match_id) {
            this.messages.push(msg.data);
            this.scrollToBottom();
          }
        } catch(e) {}
      });
      this.ws.onClose(() => {
        setTimeout(() => this.connectWS(), 3000);
      });
    },
    async sendText() {
      const content = this.text.trim();
      if (!content) return;

      // 尝试通过WebSocket发送
      if (this.ws) {
        this.ws.send(JSON.stringify({
          type: 'message',
          data: {
            match_id: parseInt(this.match_id),
            to_uid: this.peerUid,
            content,
            msg_type: 0,
            client_msg_id: 'c_' + Date.now()
          }
        }));
        this.text = '';
      } else {
        // 降级REST
        try {
          await api.post('/api/v1/message/send', { match_id: this.match_id, to_uid: this.peerUid, content, msg_type: 0 });
          this.text = '';
          this.loadMessages();
        } catch(e) {
          if (e.message.includes('会员')) {
            this.showVipTip = true;
          } else {
            uni.showToast({ title: e.message, icon: 'none' });
          }
        }
      }
    },
    sendImage() {
      uni.chooseImage({ count: 1, success: async (res) => {
        const filePath = res.tempFilePaths[0];
        try {
          const uploadRes = await api.upload('/api/v1/user/avatar', filePath);
          if (this.ws) {
            this.ws.send(JSON.stringify({
              type: 'message',
              data: {
                match_id: parseInt(this.match_id),
                to_uid: this.peerUid,
                content: uploadRes.url,
                msg_type: 1,
                client_msg_id: 'c_' + Date.now()
              }
            }));
          }
        } catch(e) { uni.showToast({ title: '发送失败', icon: 'none' }); }
      }});
    },
    scrollToBottom() {
      setTimeout(() => { this.scrollTop = 999999; }, 100);
    },
    goVip() { uni.navigateTo({ url: '/pages/vip/vip' }); }
  }
};
</script>

<style scoped>
.chat-page { display: flex; flex-direction: column; height: 100vh; background: #f5f5f5; }
.msg-list { flex: 1; padding: 20rpx; }
.msg { display: flex; margin-bottom: 24rpx; align-items: flex-start; }
.msg.my { flex-direction: row-reverse; }
.msg-avatar { width: 60rpx; height: 60rpx; border-radius: 50%; flex-shrink: 0; }
.bubble { max-width: 500rpx; padding: 16rpx 24rpx; border-radius: 16rpx; font-size: 28rpx; }
.my .bubble { background: #667eea; color: #fff; margin-right: 16rpx; }
.other .bubble { background: #fff; margin-left: 16rpx; }
.input-area { display: flex; align-items: center; padding: 16rpx 20rpx; background: #fff; border-top: 1rpx solid #e5e5e5; }
.img-btn { width: 60rpx; height: 60rpx; line-height: 60rpx; text-align: center; background: none; border: none; font-size: 40rpx; padding: 0; margin-right: 16rpx; }
.input { flex: 1; height: 72rpx; background: #f5f5f5; border-radius: 36rpx; padding: 0 24rpx; font-size: 28rpx; }
.send-btn { height: 60rpx; line-height: 60rpx; padding: 0 24rpx; background: linear-gradient(90deg, #667eea, #764ba2); color: #fff; border-radius: 30rpx; font-size: 26rpx; margin-left: 16rpx; }
.vip-tip { position: fixed; bottom: 120rpx; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: #fff; padding: 16rpx 32rpx; border-radius: 40rpx; font-size: 26rpx; display: flex; align-items: center; gap: 16rpx; }
.vip-link { color: #ffd700; }
.loading-msg { text-align: center; color: #999; font-size: 24rpx; padding: 10rpx; }
</style>
