// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})


exports.main = async (event, context) => {
  const db = cloud.database()

  const result = await db.collection('lyrics').aggregate()
    .sample({
      size:1
    })
    .end()
  return JSON.stringify(result)
}