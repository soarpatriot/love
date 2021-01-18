
function drawText(ctx, coordinates, mData, fontSize, color) {
  const yArr = coordinates.map(coordinate => {
    return coordinate[1];
  });
  const maxY = Math.max(...yArr); //最高点
  const minY = Math.min(...yArr); // 最低点
  const moveDistance = 15 / this.getRatio();
  ctx.setFontSize(fontSize);
  ctx.setFillStyle(color);
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
      ctx.fillText(mData[index].title, x, y);
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
module.exports.drawText = drawText
module.exports.getRatio = getRatio
module.exports.getCoordinatesByRadius = getCoordinatesByRadius