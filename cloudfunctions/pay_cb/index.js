// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  //console.log("pay callback: " + JSON.stringify(event))
  let result = {
    errcode: 0,
    errmsg: null
  }
  try {
    saveOrder(event)
  } catch(e) {
    result.errcode = 1
    result.errmsg = "save order info error"
    console.error(e)
  }
  return result
}

async function saveOrder(entity) {
  const db = cloud.database()
  const list = await db.collection('orders').where({
    attach: entity.attach
  }).get()
  console.log("list: " + JSON.stringify(list))
  const size = list.data.length
  if(size > 0) {
    await db.collection('orders').where({
      attach: entity.attach
    }).update({
      data: entity,
    })
  } else {
    await db.collection('orders').add({
      data: entity
    })
  }
}