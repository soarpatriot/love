//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    description: ''
  },

  goToPage: function() {
    const url = "/pages/questions/questions" 
 
    wx.navigateTo({
      url: url,
    })
  },

  onLoad: async function (options) {
    wx.cloud.callFunction({
      name: 'lyric',
    }).then(res => {
      const data = JSON.parse(res.result)
      this.setData({
        description: data.list[0].description
      })
      
    })
    .catch(e => {
      console.error('[云函数] [login] 调用失败', e)
    })
  },
  onShareAppMessage: function (res) {

  },
  onShareTimeline: function (res) {

  }

})
