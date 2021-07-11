
function  drawText(ctx, ratio, coordinates, mData, fontSize) {
    const yArr = coordinates.map(coordinate => {
      return coordinate[1];
    });
    const maxY = Math.max(...yArr); //最高点
    const minY = Math.min(...yArr); // 最低点
    const moveDistance = 15 / ratio;
    ctx.setFontSize(fontSize);
    
    //console.log("coordinates: " + coordinates.length)
    coordinates.forEach((coordinate, index) => {
      if (mData[index]) {
        console.log(mData[index]['color'])
        ctx.setFillStyle(mData[index]['color']);
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
        ctx.fillText(mData[index]['name'], x, y);
      }
    });
  }

function getRatio(windowWidth) {
  let ratio = 750 / windowWidth; // rpx/px比例
  console.log(windowWidth)
  return ratio;
}

function getCoordinatesByRadius(mRadius, mCount, rotateAngle = 0) {
  const mAngle = (Math.PI * 2) / mCount;
  let coordinates = [];
  for (let i = 1; i <= mCount + 1; i++) {
    let x = mRadius * Math.cos(mAngle * (i - 1) + rotateAngle);
    let y = mRadius * Math.sin(mAngle * (i - 1) + rotateAngle);
    coordinates.push([x, y]);
  }

  return coordinates;
}

function drawRadar(ctx, mData, lRadius, rotateAngle = 0) {
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
}

/**
 * 绘制连接线
 * @param ctx 上下文
 * @param centerX 中心x
 * @param centerY 中心y
 * @param coordinates 外边框坐标
 * @param color 连线颜色
 * @param lineWidth 连线宽度
 */
function renderLinkLine(ctx, centerX, centerY, coordinates, color, lineWidth) {
  coordinates.forEach((coordinate, index) => {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(coordinate[0], coordinate[1]);
    ctx.setStrokeStyle(color);
    ctx.setLineWidth(lineWidth);
    ctx.stroke();
    ctx.closePath();
  });
}

function renderBorder(
  ctx,
  color,
  lineWidth,
  radius,
  rotateAngle,
  mCount,
  background
) {
  let coordinates = getCoordinatesByRadius(
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
}

module.exports.drawText = drawText
module.exports.getRatio = getRatio

module.exports.drawRadar = drawRadar
module.exports.renderBorder = renderBorder
module.exports.getCoordinatesByRadius = getCoordinatesByRadius