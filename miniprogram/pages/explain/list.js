// miniprogram/pages/index/six.js

let ploy = require('../../libs/ploy.js')

Page({
  data: {
    animationData: {},
    journey: [],
    categories: ['emotion', 'potential','belief','life','love' ],
    texts: [ '情绪', '潜力','世界观','生活', '爱']
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
      let features = {}
      let questions = {}
      let suggestions = {}
      this.data.categories.forEach((key) => {
        const q = result.questions.find(element => element.category == key)
        features[key] = q.selected
        questions[key] = q.desc
        suggestions[key] = q.selected.suggestion || q.suggestion
      })
      //console.info(features)
      //console.info(questions)
      //console.info(suggestions)

      this.setData({
        totalScore: result.total_score,
        features: features,
        questions: questions,
        suggestions: suggestions,
      })

      let selected = this.data.categories.map((value) => {
        const q = result.questions.find(element => element.category == value)
        return q.selected
      })
      
      console.info("mdata:" )
      console.info(selected)
      this.init(selected);
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
 
  init(mData) {
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
    const lCoordinates = ploy.getCoordinatesByRadius(
      L_RADIUS,
      mCount,
      -rotateAngle
    );
    //绘制边框线
    this.renderBorder(
      ctx,
      "#66ccff",
      LINE_WIDTH,
      L_RADIUS,
      -rotateAngle,
      mCount,
      "#fff"
    );
    //绘制边框线
    this.renderBorder(
      ctx,
      "#66ccff",
      LINE_WIDTH,
      L_RADIUS * 0.8,
      -rotateAngle,
      mCount,
      "#fff"
    );
        //绘制边框线
    this.renderBorder(
      ctx,
      "#66ccff",
      LINE_WIDTH,
      L_RADIUS * 0.6,
      -rotateAngle,
      mCount,
      "#fff"
    );

    //绘制边框线
    this.renderBorder(
      ctx,
      "#66ccff",
      LINE_WIDTH,
      L_RADIUS * 0.4,
      -rotateAngle,
      mCount,
      "#fff"
    );
    //绘制边框线
    this.renderBorder(
      ctx,
      "#66ccff",
      LINE_WIDTH,
      L_RADIUS * 0.2,
      -rotateAngle,
      mCount,
      "#fff"
    );

    //绘制边框线
    this.renderBorder(
      ctx,
      "#66ccff",
      LINE_WIDTH,
      L_RADIUS * 0.01,
      -rotateAngle,
      mCount,
      "#fff"
    );
    //绘制文字
    const systemInfo = wx.getSystemInfoSync()
    const windowWidth = systemInfo.windowWidth
    this.drawText(
      ctx,
      lCoordinates,
      this.data.texts,
      32 / ploy.getRatio(windowWidth), //26rpx
      "#0000cc"
    );
    this.drawRadar(
      ctx,
      mData,
      L_RADIUS,
      -rotateAngle
    );
    ctx.draw();

  },
  /**
   * 获取多边形坐标
   * @param mRadius 半径
   * @param mCount 边数
   * @param rotateAngle 旋转角度
   * @return {Array}
   */
  getCoordinatesByRadius(mRadius, mCount, rotateAngle = 0) {
    const mAngle = (Math.PI * 2) / mCount;
    let coordinates = [];
    for (let i = 1; i <= mCount + 1; i++) {
      let x = mRadius * Math.cos(mAngle * (i - 1) + rotateAngle);
      let y = mRadius * Math.sin(mAngle * (i - 1) + rotateAngle);
      coordinates.push([x, y]);
    }

    return coordinates;
  },
  /**
   * 绘制边框
   * @param cxt 上下文
   * @param color 线框颜色
   * @param lineWidth 线宽
   * @param radius 半径
   * @param rotateAngle 旋转角度
   * @param background 背景色
   */
  renderBorder(
    ctx,
    color,
    lineWidth,
    radius,
    rotateAngle,
    mCount,
    background
  ) {
    let coordinates = ploy.getCoordinatesByRadius(
      radius,
      mCount,
      rotateAngle
    );
    ctx.beginPath();
    coordinates.forEach((coordinate, index) => {
      if (index == 0) {
        ctx.moveTo(coordinate[0], coordinate[1]);
      } else {
        ctx.lineTo(coordinate[0], coordinate[1]);
      }
    });
    ctx.setStrokeStyle(color);
    ctx.setLineWidth(lineWidth);
    ctx.stroke();
    if (background) {
      ctx.setFillStyle(background);
      ctx.fill();
    }
    ctx.closePath();
  },
  /**
   * 绘制连接线
   * @param ctx 上下文
   * @param centerX 中心x
   * @param centerY 中心y
   * @param coordinates 外边框坐标
   * @param color 连线颜色
   * @param lineWidth 连线宽度
   */
  renderLinkLine(ctx, centerX, centerY, coordinates, color, lineWidth) {
    coordinates.forEach((coordinate, index) => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(coordinate[0], coordinate[1]);
      ctx.setStrokeStyle(color);
      ctx.setLineWidth(lineWidth);
      ctx.stroke();
      ctx.closePath();
    });
  },
  /**
   * 绘制雷达图
   * @param ctx
   * @param mData
   * @param lRadius
   * @param rotateAngle
   */
  drawRadar(ctx, mData, lRadius, rotateAngle = 0) {
    const mCount = mData.length;
    let radius = [];
    mData.forEach((item, index) => {
      radius.push((item.weight / item.full_score) * lRadius);
    });
    radius.push((mData[0].weight / mData[0].full_score) * lRadius);
 
    const mAngle = (Math.PI * 2) / mCount;
    let coordinates = [];
    for (let i = 1; i <= mCount + 1; i++) {
      let x = radius[i - 1] * Math.cos(mAngle * (i - 1) + rotateAngle);
      let y = radius[i - 1] * Math.sin(mAngle * (i - 1) + rotateAngle);
      coordinates.push([x, y]);
    }
 
    ctx.beginPath();
    coordinates.forEach((coordinate, index) => {
      if (index == 0) {
        ctx.moveTo(coordinate[0], coordinate[1]);
      } else {
        ctx.lineTo(coordinate[0], coordinate[1]);
      }
    });
 
    ctx.setFillStyle("rgba(0,0,102,0.4)");
    ctx.fill();
    ctx.closePath();
  },
  /**
   * 绘制文字
   * @param ctx 上下文
   * @param coordinates 文字坐标
   * @param mData 文字数据
   * @param fontSize 文字大小
   * @param color 文字颜色
   */
  drawText(ctx, coordinates, mData, fontSize, color) {
    const yArr = coordinates.map(coordinate => {
      return coordinate[1];
    });
    const maxY = Math.max(...yArr); //最高点
    const minY = Math.min(...yArr); // 最低点
    const moveDistance = 15 / this.getRatio();
    ctx.setFontSize(fontSize);
    ctx.setFillStyle(color);
    console.log("coordinates: " + coordinates)
    coordinates.forEach((coordinate, index) => {
      if (mData[index]) {
        let x = coordinate[0];
        let y = coordinate[1];
        if (maxY == coordinate[1]) {
          y += moveDistance;
          ctx.setTextAlign("center");
          ctx.setTextBaseline("top");
        } else if (minY == coordinate[1]) {
          ctx.setTextBaseline("bottom");
          ctx.setTextAlign("center");
          y -= moveDistance;
        } else if (coordinate[0] < 0) {
          ctx.setTextAlign("right");
          ctx.setTextBaseline("middle");
          x -= moveDistance;
        } else if (coordinate[0] > 0) {
          ctx.setTextAlign("left");
          ctx.setTextBaseline("middle");
          x += moveDistance;
        }
        ctx.fillText(mData[index], x, y);
      }
    });
  },
})
