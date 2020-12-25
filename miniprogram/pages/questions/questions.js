// miniprogram/pages/questions.js
Page({

  /**
   * Page initial data
   */
  data: {
    questions: []
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    wx.cloud.callFunction({
      name: 'questions',
      data: {},
      success: res => {
        const data = JSON.parse(res.result)
        console.info(data)
        this.setData({
          questions: data.list
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)

      }
    })
    // const db = wx.cloud.database({env: 'test-3glvzxwge4dbbb17'})
    // db.collection('questions').aggregate()
    //   .lookup({
    //     from: 'answers',
    //     localField: '_id',
    //     foreignField: 'question_id',
    //     as: 'answers'
    //   }).end()
    //   .then(res => console.log(res.data))
    //   .catch(err => console.error(err))
  },

  formSubmit(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
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