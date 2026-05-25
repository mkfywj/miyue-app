<template>
  <view class="detail-page">
    <!-- 群信息 -->
    <view class="group-header">
      <image class="cover" :src="group.cover_url || '/static/default-group.png'" mode="aspectFill"></image>
      <view class="info">
        <text class="name">{{ group.name }}</text>
        <text class="meta">{{ group.category || '综合' }} · {{ group.city || '全国' }} · {{ group.member_count }}人</text>
        <text class="desc" v-if="group.description">{{ group.description }}</text>
        <text class="owner">群主：{{ group.owner_name || '未知' }}</text>
      </view>
    </view>

    <!-- 加群/管理按钮 -->
    <view class="actions">
      <button v-if="!myStatus" class="action-btn" @click="joinGroup">申请加群</button>
      <button v-if="myStatus === 1 && myRole <= 1" class="action-btn" @click="leaveGroup">退出群</button>
      <button v-if="myRole >= 1" class="action-btn admin-btn" @click="showPending">审核成员</button>
      <text v-if="myStatus === 0" class="pending-text">⏳ 审核中</text>
    </view>

    <!-- 群成员 -->
    <view class="section">
      <text class="section-title">群成员 ({{ members.length }})</text>
      <scroll-view scroll-x class="member-scroll">
        <view class="member" v-for="m in members" :key="m.uid" @click="viewUser(m)">
          <image class="avatar" :src="m.avatar_url || '/static/default-avatar.png'" mode="aspectFill"></image>
          <text class="mname">{{ m.nickname }}</text>
          <text class="mrole" v-if="m.role === 2">群主</text>
          <text class="mrole" v-else-if="m.role === 1">管理</text>
        </view>
      </scroll-view>
    </view>

    <!-- 群聊天（仅成员可见） -->
    <view class="section" v-if="myStatus === 1">
      <text class="section-title">群聊</text>
      <view class="chat-area">
        <view class="chat-msg" v-for="m in messages" :key="m.id">
          <image class="cavatar" :src="m.avatar_url || '/static/default-avatar.png'" mode="aspectFill"></image>
          <view class="cbody">
            <text class="cname">{{ m.nickname }}</text>
            <image v-if="m.msg_type === 1" :src="m.content" mode="widthFix" class="cimg"></image>
            <text v-else class="ctext">{{ m.content }}</text>
          </view>
        </view>
        <view class="empty" v-if="messages.length === 0">暂无群消息</view>
      </view>
      <view class="chat-input" v-if="myStatus === 1">
        <input class="input" v-model="text" placeholder="说点什么..." @confirm="sendMsg" confirm-type="send" />
        <button class="send-btn" @click="sendMsg">发送</button>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/api/request';
export default {
  data() {
    return {
      groupId: null, group: {}, members: [], messages: [],
      myStatus: null, myRole: 0, text: '', loading: false
    };
  },
  onLoad(params) {
    this.groupId = params.id;
    this.load();
  },
  methods: {
    async load() {
      try {
        const [g, mbrs, msgs] = await Promise.all([
          api.get('/api/v1/group/' + this.groupId),
          api.get('/api/v1/group/' + this.groupId + '/members'),
          api.get('/api/v1/group/' + this.groupId + '/messages?limit=30')
        ]);
        this.group = g;
        this.myStatus = g.my_status;
        this.myRole = g.my_role || 0;
        this.members = mbrs;
        this.messages = msgs;
      } catch(e) { uni.showToast({ title: e.message, icon: 'none' }); }
    },
    async joinGroup() {
      try {
        const res = await api.post('/api/v1/group/' + this.groupId + '/join');
        if (res.status === 'pending') { this.myStatus = 0; }
        else if (res.status === 'joined') { this.myStatus = 1; this.load(); }
        uni.showToast({ title: res.message || '操作成功', icon: 'success' });
      } catch(e) { uni.showToast({ title: e.message, icon: 'none' }); }
    },
    async leaveGroup() {
      try {
        await api.del('/api/v1/group/' + this.groupId + '/leave');
        this.myStatus = null;
        uni.showToast({ title: '已退出', icon: 'success' });
      } catch(e) { uni.showToast({ title: e.message, icon: 'none' }); }
    },
    showPending() { uni.showToast({ title: '审核功能开发中', icon: 'none' }); },
    async sendMsg() {
      if (!this.text.trim()) return;
      // MVP: 通过 REST API 发送（WebSocket 群聊功能后续升级）
      try {
        await api.post('/api/v1/message/send', {
          match_id: -1, to_uid: 'group:' + this.groupId,
          content: this.text, msg_type: 0
        });
        this.text = '';
        const msgs = await api.get('/api/v1/group/' + this.groupId + '/messages?limit=30');
        this.messages = msgs;
      } catch(e) { uni.showToast({ title: e.message, icon: 'none' }); }
    },
    viewUser(m) { /* 查看用户资料 */ }
  }
};
</script>

<style scoped>
.group-header { display: flex; padding: 30rpx; background: #fff; }
.cover { width: 160rpx; height: 160rpx; border-radius: 16rpx; flex-shrink: 0; }
.info { flex: 1; margin-left: 24rpx; }
.name { font-size: 34rpx; font-weight: bold; display: block; }
.meta { font-size: 24rpx; color: #999; margin-top: 8rpx; display: block; }
.desc { font-size: 26rpx; color: #666; margin-top: 12rpx; display: block; }
.owner { font-size: 24rpx; color: #999; margin-top: 8rpx; display: block; }
.actions { padding: 20rpx 30rpx; background: #fff; border-top: 1rpx solid #f0f0f0; }
.action-btn { height: 64rpx; line-height: 64rpx; padding: 0 40rpx; background: linear-gradient(90deg, #667eea, #764ba2); color: #fff; border-radius: 32rpx; font-size: 26rpx; display: inline-block; margin-right: 16rpx; }
.admin-btn { background: #ff9800; }
.pending-text { font-size: 26rpx; color: #ff9800; }
.section { background: #fff; margin-top: 16rpx; padding: 24rpx 30rpx; }
.section-title { font-size: 28rpx; font-weight: bold; display: block; margin-bottom: 16rpx; }
.member-scroll { white-space: nowrap; }
.member { display: inline-block; text-align: center; margin-right: 24rpx; }
.avatar { width: 80rpx; height: 80rpx; border-radius: 50%; display: block; margin: 0 auto; }
.mname { font-size: 22rpx; color: #333; display: block; margin-top: 6rpx; }
.mrole { font-size: 20rpx; color: #667eea; display: block; }
.chat-area { max-height: 500rpx; overflow-y: auto; }
.chat-msg { display: flex; margin-bottom: 16rpx; align-items: flex-start; }
.cavatar { width: 50rpx; height: 50rpx; border-radius: 50%; flex-shrink: 0; margin-right: 12rpx; }
.cbody { flex: 1; }
.cname { font-size: 22rpx; color: #999; display: block; }
.cimg { max-width: 200rpx; border-radius: 8rpx; margin-top: 4rpx; }
.ctext { font-size: 26rpx; color: #333; margin-top: 4rpx; display: block; }
.chat-input { display: flex; align-items: center; padding: 16rpx 0; border-top: 1rpx solid #f0f0f0; margin-top: 16rpx; }
.input { flex: 1; height: 64rpx; background: #f5f5f5; border-radius: 32rpx; padding: 0 24rpx; font-size: 26rpx; }
.send-btn { height: 60rpx; line-height: 60rpx; padding: 0 24rpx; background: linear-gradient(90deg, #667eea, #764ba2); color: #fff; border-radius: 30rpx; font-size: 24rpx; margin-left: 12rpx; }
.empty { text-align: center; color: #ccc; font-size: 24rpx; padding: 30rpx; }
</style>
