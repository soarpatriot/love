// miniprogram/pages/index/six.js

let ploy = require('../../libs/ploy.js')
let utils = require('../../libs/utils.js')

Page({
  data: {
    animationData: {},
    journey: [],
    categories: utils.categories

  },
  onShow: function () {
    
  },
  onLoad: function (options) {
    const journey_id = options.journey_id
    
    wx.cloud.callFunction({
      name: 'journeys',
      data: {
        action: 'findJourneyAnswers',
        id: journey_id}
    }).then(res => {
      const result = JSON.parse(res.result)
      this.setData({
        journey: result
      })
      console.log(result)

      let allQuestions = []
      utils.categories.forEach((category) => {
        console.log(category)
        let ques = result.questions.filter((q) => { 
          return q.category == category
        })
        allQuestions = allQuestions.concat(ques)
      })
      console.log('all:')
      console.log(allQuestions)
      //rader data
      const selected = allQuestions.map((q) => {
        return q.selected
      })
      //rader text
      const catetoryNames = allQuestions.map((q) => {
        return q.name
      })

      console.info("mdata:" )
      console.info(selected)
      this.init(selected, catetoryNames);
    })
    .catch(e => {
      console.error('explain list: ', e)
    })
  
  },
 
  getRatio() {
    let systemInfo = wx.getSystemInfoSync();
    let ratio = 750 / systemInfo.windowWidth; // rpx/px比例
    console.log(systemInfo.windowWidth)
    return ratio;
  },
 
  init(mData, catetoryNames) {
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
    ploy.drawText(ctx, this.getRatio(), lCoordinates, catetoryNames, 32 / ploy.getRatio(windowWidth), "#0000cc");
    ploy.drawRadar(ctx, mData, L_RADIUS, -rotateAngle);
    ctx.draw();
  }
})
