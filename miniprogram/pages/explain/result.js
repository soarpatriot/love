// miniprogram/pages/explain/result.js
Page({

  /**
   * Page initial data
   */
  data: {
    animationData: {},
    sixData: {
      one: 4,
      two: 7,
      three: 6,
      four: 6,
      five: 4,
      six: 8
    },
    features: {}
  },

  /**
   * Lifecycle function--Called when page load
   */
  start: function(options) {
    this.drawCanvas();
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease'
    })
    animation.scale(1, 1).step()
    //this.data.animationData = animation.export()
    this.setData({
      animationData: animation.export()
    })
  },
  onLoad: function (options) {
    const journey_id = options.journey_id
    console.log("journey_id: " + journey_id)
    wx.cloud.callFunction({
      name: 'journeys',
      data: {
        action: 'findJourney',
        id: journey_id}
    }).then(res => {
      const data = JSON.parse(res.result)
      this.setData({
        features: data
      })
      console.info(data)
      
    })
    .catch(e => {
      console.error('[云函数] [login] 调用失败', e)
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

  },

  drawCanvas: function () {
    const unit = 24  // 单位
    const centerDotX = 375  // 中心点
    const centerDotY = 407  // 中心点
    // 第一个点 位置
    let dotOne = {
      x: centerDotX,
      y: centerDotY - this.data.sixData.one * unit
    }
    // 第二个点 位置
    const lineLongTwo = unit * this.data.sixData.two
    let dotTwo = {
      x: centerDotX + lineLongTwo * Math.cos((30 * Math.PI) / 180),
      y: centerDotY - lineLongTwo * Math.sin((30 * Math.PI) / 180)
    }
    console.log(dotTwo)
    // 第三个点 位置
    const lineLongThree = unit * this.data.sixData.three
    let dotThree = {
      x: centerDotX + lineLongThree * Math.cos((30 * Math.PI) / 180),
      y: centerDotY + lineLongThree * Math.sin((30 * Math.PI) / 180)
    }
    // 第四个点 位置
    let dotFour = {
      x: centerDotX,
      y: centerDotY + this.data.sixData.four * unit
    }
    console.log(dotFour, '第五个点')
    // 第五个点 位置
    const lineLongFive = unit * this.data.sixData.five
    let dotFive = {
      x: centerDotX - lineLongFive * Math.cos((30 * Math.PI) / 180),
      y: centerDotY + lineLongFive * Math.sin((30 * Math.PI) / 180)
    }
     // 第六个点 位置
    const lineLongSix = unit * this.data.sixData.six
    let dotSix = {
      x: centerDotX - lineLongSix * Math.cos((30 * Math.PI) / 180),
      y: centerDotY - lineLongSix * Math.sin((30 * Math.PI) / 180)
    }
    const ctx = wx.createCanvasContext('myCanvas')
    ctx.beginPath()
    ctx.moveTo(dotOne.x / 2, dotOne.y / 2)
    ctx.lineTo(dotTwo.x / 2, dotTwo.y / 2)
    ctx.lineTo(dotThree.x / 2, dotThree.y / 2)
    ctx.lineTo(dotFour.x / 2, dotFour.y / 2)
    ctx.lineTo(dotFive.x / 2, dotFive.y / 2)
    ctx.lineTo(dotSix.x / 2, dotSix.y / 2)
    ctx.lineTo(dotOne.x / 2, dotOne.y / 2)
    
    ctx.strokeStyle = "rgba(60, 77, 125, 1)"
    // ctx.setStrokeStyle('blue')
    ctx.setLineWidth(2)
    ctx.stroke()
    // 渐变色
    //const grd = ctx.createLinearGradient(0, 0, 200, 0)
    //grd.addColorStop(0, 'red')
    //grd.addColorStop(1, 'white')
    ctx.fillStyle = "rgba(60, 77, 125, 0.8)";
    //ctx.setFillStyle(rgba(11, 51, 142, 0.2))
    // 透明度
    //ctx.setGlobalAlpha(0.2)
    // 填充
    ctx.fill()
    ctx.draw()
  }
})