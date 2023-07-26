// 云函数入口文件
const cloud = require('wx-server-sdk')


const envId = cloud.DYNAMIC_CURRENT_ENV

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境


exports.main = async (event, context) => {
  const { ENV, OPENID, APPID } = cloud.getWXContext()
  const journeyId = event.journeyId
  const mchid = '1648066848'
  const body = '详细分析-分析服务'
  const num = Date.now()
  console.log("journeyId: " + journeyId)
  console.log("ENV_ID: " + ENV)
  const res = await cloud.cloudPay.unifiedOrder({
    "body" : body,
    "outTradeNo" : `${num}`,
    "spbillCreateIp" : "127.0.0.1",
    "subMchId" : mchid,
    "totalFee" : 999,
    "attach": journeyId,
    "envId": ENV,
    "functionName": "pay_cb"
  })
  return res
}
