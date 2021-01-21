// miniprogram/pages/questions.js
Page({

  /**
   * Page initial data
   * //kindness, life,  emotion, cooperate, belief, potential
   */
  data: {
    hidden: false,
    catetroies: ['openness', 'emotion', 'cooperation', 'belief', 'potential'],
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
          questions: data,
          hidden: true
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        this.setData({
          hidden: true
        })
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
    const values = e.detail.value
    let blank = false
    let journey = {}
    let answers = []
    //console.log('form发生了submit事件，携带数据为：', values)
    const categories = this.data.catetroies
    
    categories.forEach((e) => {
      const q_id = 'question_id'
      const a_id = 'answer_id'
      let answer = {
        q_id: values[`${e}_${q_id}`],
        a_id: values[`${e}_${a_id}`]
      }
      //journey = 
      //journey[e] = null
      //console.log('qqq', values[`${e}_${q_id}`])
      //console.log('aaa', values[`${e}_${a_id}`])
      if(values[`${e}_${a_id}`] == '') {
        blank = true
      }
      answers.push(answer)
      //journey[e][a_id] = ''
    })

    // blanks = values.filter((v) => { v === ''})
    if(blank) {
      wx.showToast({
        title: '您有未选择答案的题目，请选择！',
        icon: 'error'
      })
      return
    }

    //console.log('journey', journey)
    journey = {
      answers: answers
    }
    wx.cloud.callFunction({
      name: 'journeys',
      data: { 
        action: 'addJourney',
        entity: journey }
    }).then(res => {
      const data = JSON.parse(res.result)
      console.log('save data: ')
      console.info(JSON.parse(res.result))
      
      const url = "/pages/explain/list?journey_id=" + data._id
      wx.navigateTo({
        url: url,
      })
    })
    .catch(e => {
      console.error('[云函数] [login] 调用失败', e)
    })

    // db.collection('journeys').add({
    //   data: journey,
    //   success: function(res) {
    //     // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
    //     console.log(res)

    //     const url = "/pages/explain/result" 
 
    //     wx.navigateTo({
    //       url: url,
    //     })
    //   },
    //   fail: err => {
    //     console.error('save 调用失败', err)
    //   }
    // })
    

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