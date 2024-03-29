// miniprogram/pages/index/six.js

let ploy = require('../../libs/ploy.js')
let utils = require('../../libs/utils.js')

Page({
  data: {
    hidden: false,
    animationData: {},
    questions: [],
    analysisItems: [],
    journey_id: "",
    totalScore: 0,
    journey: null,
  },
  onShow: function () {
    
  },

  onShareAppMessage: function (res) {
    console.log("xxxff")

    return {
      title: '因为爱情之爱有几分',
      path: `/pages/index/index?journey-id=${this.data.journey_id}`
    }
  },
  onShareTimeline: function (res) {
    return {
      title: '因为爱情之爱有几分',
      path: `/pages/index/index?journey-id=${this.data.journey_id}`
    }
  },

  onLoad: function (options) {
    this.setData({
      journey_id: options.journey_id,
    })
    //const journey_id = options.journey_id
    
    wx.cloud.callFunction({
      name: 'journeys',
      data: {
        action: 'findJourneyAnswers',
        id: this.data.journey_id}
    }).then(res => {
      const result = JSON.parse(res.result)
      //console.log("result:" + JSON.stringify(result))
     

      let allQuestions = []
      utils.categories.forEach((cate) => {
        let ques = result.questions.filter((q) => { 
          return q.category == cate.key
        })
        allQuestions = allQuestions.concat(ques)
      })
      this.setData({
        journey: result.journey,
        questions: allQuestions,
        totalScore: result.total_score
      })

      
      //rader data
      const selected = result.ploys
      
      // allQuestions.map((q) => {
      //   return q.selected
      // })

      const analysisItems = allQuestions.map((q) => {
        let cateData = utils.categories.find(cate =>  q.category == cate.key)
        return { weight: q.selected.weight, name: q.name, color: cateData.color }
      })
      
      this.setData({
        analysisItems: analysisItems
      })

      //rader text
      const cateData = allQuestions.map((q) => {
        let category = utils.categories.find(cate =>  q.category == cate.key)
        return { name: q.name, color: category.color}
      })

      this.init(selected, cateData);
      this.setData({
        hidden: true
      })
    })
    .catch(e => {
      console.error('explain list: ', e)
    })
  
  },

  onPaying: async function(options) {
    console.log('xx')
    
    const id = this.data.journey_id
    const that = this
  
    wx.cloud.callFunction({
      name: 'pay',
      data: {
        journeyId: id
      },

      success: res => {
        const payment = res.result.payment
        console.log(res)
        wx.requestPayment({
          ...payment,
          success (res) {
            console.log('pay success', res)
            that.blockJourney(id)
          },
          fail (err) {
            console.error('pay fail', err)
          }
        })
      },
      fail: console.error,
    })
    // const openid = res.result.openid
    // console.log(res.result.openid)

    // const { appId } = wx.getAccountInfoSync().miniProgram;
    // const mchid = '1648066848'
    // console.log(appId)
    // const payInfo = {
    //   "mchid": mchid,
    //   "out_trade_no": "1217752501201407033233368318",
    //   "appid": appId,
    //   "description": "详细分析",
    //   "notify_url": "https://www.weixin.qq.com/wxpay/pay.php",
    //   "amount": {
    //     "total": 1,
    //     "currency": "CNY"
    //   },
    //   "payer": {
    //     "openid": openid
    //   }
    // }

    
  },
 
  getRatio() {
    let systemInfo = wx.getSystemInfoSync();
    let ratio = 750 / systemInfo.windowWidth; // rpx/px比例
    //console.log(systemInfo.windowWidth)
    return ratio;
  },
 
  init(mData, cateData) {
    const L_RADIUS = 200 / this.getRatio(); // 大圆半径
    const LINE_WIDTH = 2 / this.getRatio(); //线宽
    const ctx = wx.createCanvasContext("canvas");

    const canvasW = 750 / this.getRatio(); // canvas宽
    const canvasH = 750 / this.getRatio(); //canvas高
    //清空画布
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.save();
    // 重新映射 canvas的 (0, 0)，映射的结果是让canvas的坐标原点位于 canvas的中心位
    ctx.translate(canvasW / 2, canvasH / 2);
    // 多边形的边数
    const mCount = mData.length;
    // 需要旋转多少度，才能将多边形旋转到底边平行于 X轴，奇多边形才需要，偶多边形不需要旋转
    const sAngle = (90 / mCount / 180) * Math.PI;
    let rotateAngle = mCount % 2 === 0 ? 0 : sAngle * (mCount % 4 === 3 ? -1 : 1); //底边平行x轴
    // 多边形外接圆半径
    const lCoordinates = ploy.getCoordinatesByRadius(L_RADIUS, mCount, -rotateAngle);
    //绘制边框线
    ploy.renderBorder(ctx, "#66ccff", LINE_WIDTH, L_RADIUS, -rotateAngle, mCount, "#fff");
    ploy.renderBorder(ctx, "#66ccff", LINE_WIDTH, L_RADIUS * 0.8, -rotateAngle, mCount, "#fff");
    ploy.renderBorder(ctx, "#66ccff", LINE_WIDTH, L_RADIUS * 0.6, -rotateAngle, mCount, "#fff");
    ploy.renderBorder(ctx, "#66ccff", LINE_WIDTH, L_RADIUS * 0.4, -rotateAngle, mCount, "#fff");
    ploy.renderBorder(ctx, "#66ccff", LINE_WIDTH, L_RADIUS * 0.2, -rotateAngle, mCount, "#fff");
  
    //绘制文字
    const systemInfo = wx.getSystemInfoSync()
    const windowWidth = systemInfo.windowWidth
    console.log(JSON.stringify(mData))
    ploy.drawText(ctx, this.getRatio(), lCoordinates, cateData, 32 / ploy.getRatio(windowWidth));
    ploy.drawRadar(ctx, mData, L_RADIUS, -rotateAngle);
    ctx.draw();
  },

  blockJourney(id) {
    wx.cloud.callFunction({
      name: 'journeys',
      data: { 
        action: 'unblock',
        id: id }
    }).then(res => {
      const data = JSON.parse(res.result)
      //console.info(JSON.parse(res.result))
      const url = "/pages/explain/list?journey_id=" + id
      wx.redirectTo({
        url: url,
      })
    })
  }
})
