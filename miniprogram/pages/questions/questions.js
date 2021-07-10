// miniprogram/pages/questions.js
let utils = require('../../libs/utils.js')

const app = getApp();

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
        console.error('[云函数] [fetch question] 调用失败', err)
        this.setData({
          hidden: true
        })
      }
    })
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

      if(values[`${e}_${a_id}`] == '') {
        blank = true
      }
      answers.push(answer)
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
      wx.redirectTo({
        url: url,
      })
    })
    .catch(e => {
      console.error('add journey', e)
    })


  }
  
})