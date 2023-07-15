// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境


exports.main = async (event, context) => {
  const mchid = '1648066848'
  const body = '详细分析-分析服务'
  const num = Date.now()
  const res = await cloud.cloudPay.unifiedOrder({
    "body" : body,
    "outTradeNo" : `${num}`,
    "spbillCreateIp" : "127.0.0.1",
    "subMchId" : mchid,
    "totalFee" : 1.00,
    "envId": 'develop-9g3hkzzhd2aed328',
    "functionName": "pay_callback"
  })
  return res
}
