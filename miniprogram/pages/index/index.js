
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    description: ''
  },

  exploring: function() {
    const url = "/pages/questions/questions" 
    wx.navigateTo({
      url: url,
    })
  },

  onLoad: async function (options) {
    console.log(options['journey-id'])
    wx.cloud.callFunction({
      name: 'lyric',
    }).then(res => {
      const data = JSON.parse(res.result)
      this.setData({
        description: data.list[0].description
      })
    }).catch(e => {
      console.error('[云函数] [lyric] 调用失败', e)
    })

    // if the journey-id exists
    if(options['journey-id']) {
      wx.cloud.callFunction({
        name: 'journeys',
        data: {
          action: 'unblock',
          id: options['journey-id']}
      }).then(res => {
        //const result = JSON.parse(res.result)
        console.log("result:" + JSON.stringify(res))
      }).catch(e => {
        console.error('[云函数] [journeys.unblock] 调用失败', e)
      })
    }

  },
  onShareAppMessage: function (res) {

  },
  onShareTimeline: function (res) {

  }
})
