// api/request.js — 统一API请求封装
const BASE_URL = "https://shop.youjiangbiji.cn/api/v1"

function getToken() {
  return uni.getStorageSync('token');
}

function request(method, url, data) {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const header = { 'Content-Type': 'application/json' };
    if (token) header['Authorization'] = 'Bearer ' + token;

    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header,
      success: (res) => {
        if (res.statusCode === 401) {
          uni.removeStorageSync('token');
          uni.reLaunch({ url: '/pages/login/login' });
          reject(new Error('登录已过期'));
          return;
        }
        if (res.data.success) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.error || '请求失败'));
        }
      },
      fail: (err) => {
        reject(new Error('网络错误'));
      }
    });
  });
}

export default {
  get: (url) => request('GET', url),
  post: (url, data) => request('POST', url, data),
  put: (url, data) => request('PUT', url, data),
  del: (url) => request('DELETE', url),
  upload: (url, filePath, name = 'file') => {
    return new Promise((resolve, reject) => {
      const token = getToken();
      uni.uploadFile({
        url: BASE_URL + url,
        filePath,
        name,
        header: token ? { 'Authorization': 'Bearer ' + token } : {},
        success: (res) => {
          const data = JSON.parse(res.data);
          if (data.success) resolve(data.data);
          else reject(new Error(data.error));
        },
        fail: () => reject(new Error('上传失败'))
      });
    });
  }
};
