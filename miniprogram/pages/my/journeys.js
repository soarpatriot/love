// miniprogram/pages/my/journeys.js

const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    hidden: false,
    questions: []
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    //const openid = app.globalData.openid

    wx.cloud.callFunction({
      name: 'journeys',
      data: {
        action: 'my',
      }
    }).then(res => {
      const result = JSON.parse(res.result)
      console.log(result)
      this.setData({
        journeys: result.list,
        hidden: true
      })
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})