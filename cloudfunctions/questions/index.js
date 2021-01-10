// 云函数入口文件
const cloud = require('../journeys/node_modules/wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const categories = ['life', 'bus', 'love', 'promising', 'social']

  qsPromises = categories.map((c) => getSampleQuestion(c))

  const resObjs = await Promise.all(qsPromises)
  const resArr = resObjs.map((r) => r.list)

  const arr = resArr.reduce((a, b) => [...a, ...b], []);

  
  // const db = cloud.database()
  // const res = await db.collection('questions').aggregate()
  // .match({category:'life'})
  // .sample({
  //   size:1
  // })
  // .lookup({
  //   from: 'answers',
  //   localField: '_id',
  //   foreignField: 'question_id',
  //   as: 'answers'
  // }).end()
  return JSON.stringify(arr)
}

function getSampleQuestion(catetory) {
  const db = cloud.database()
  return db.collection('questions').aggregate()
  .match({category:catetory})
  .sample({
    size:1
  })
  .lookup({
    from: 'answers',
    localField: '_id',
    foreignField: 'question_id',
    as: 'answers'
  }).end()


  //return JSON.stringify(res)
}