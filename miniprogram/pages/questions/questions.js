// miniprogram/pages/questions.js
let utils = require('../../libs/utils.js')

Page({

  /**
   * Page initial data
   * //kindness, life,  emotion, cooperate, belief, potential
   */
  data: {
    hidden: false,
    catetroies: utils.categories,
    questions: []
  },

  /**
   * fetch the questions from cloud
   */
  onLoad: function () {
    wx.cloud.callFunction({
      name: 'questions',
      data: {} })
    .then(res => {
      const data = JSON.parse(res.result)
      
      this.setData({
        questions: data,
        hidden: true
      })
    }).catch(e => {
      console.error('[云函数] [fetch question] 调用失败', e)
      this.setData({
        hidden: true
      })
    })
  },

  formSubmit(e) {
    const formData = e.detail.value

    const answers = Object.values(formData)
    console.log(answers)
    const valueBlank = (element) => element === "";
    const isBlank = answers.some(valueBlank)
    
    // blanks = values.filter((v) => { v === ''})
    if(isBlank) {
      wx.showToast({
        title: '您有未选择答案的题目，请选择！',
        icon: 'error'
      })
      return
    }

    let journey = {
      answers: answers
    }


    wx.cloud.callFunction({
      name: 'journeys',
      data: { 
        action: 'addJourney',
        entity: journey }
    }).then(res => {
      const data = JSON.parse(res.result)
      //console.info(JSON.parse(res.result))
      const url = "/pages/explain/list?journey_id=" + data._id
      wx.redirectTo({
        url: url,
      })
    })
    .catch(e => {
      console.error('add journey', e)
    })
  }
})