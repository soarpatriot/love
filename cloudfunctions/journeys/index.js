// 云函数入口文件
const cloud = require('wx-server-sdk')
const timeago = require('timeago.js')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  switch (event.action) {
    case 'my': {
      return my()
    }
    case 'addJourney': {
      return addJourney(event.entity)
    }
    case 'findJourney': {
      return findJourney(event.id)
    }
    case 'findJourneyAnswers': {
      return findJourneyAnswers(event.id)
    }
    default: {
      return
    }
  }

}


async function my() {
  const db = cloud.database()
  const $ = db.command.aggregate
  let { OPENID} = cloud.getWXContext()
  console.log("openid: " + OPENID)
  const result = await db.collection('journeys').aggregate()
  .match({
    _openid: OPENID
  })
  .sort({
    created_at: -1
  })
  .addFields({
    ago: timeago.format('$created_at', 'zh_CN')
  }).end()
  
  // .where({
  //   _openid: OPENID,
  // })
  return JSON.stringify(result)
}

async function addJourney(entity) {
  const db = cloud.database()
  let { OPENID} = cloud.getWXContext()
  console.log('openid:' + OPENID)
  entity._openid = OPENID
  entity.created_at = db.serverDate()
  const j = await db.collection('journeys').add({
    data: entity
  })
  console.log("journeys: " + j)
  return JSON.stringify(j)
}



async function findJourneyAnswers(id) {
  
  const db = cloud.database()
  const _ = db.command
  const result = await db.collection('journeys').doc(id).get()
  const answerIds = result.data.answers

  let r = await db.collection('questions').where({
    "answers._id": _.in(answerIds)
  }).get()
 
  const questionsWithSelected = selectedItems(answerIds, r)
  const total = totalScore(questionsWithSelected)
  const ploys = ploygen(questionsWithSelected)
  const orderedPloys = ployDataOrder(ploys)

  const rs = {
     "questions": questionsWithSelected,
     "total_score": total,
     "ploys": orderedPloys
  }
  return JSON.stringify(rs)
}


function ploygen(questions) {
  const ploys = questions.map((q) => {
    return {
      category: q.category,
      weight: q.selected.weight,
      name: q.name,
      full_score: 100
    }
  })

  return ploys
}

function ployDataOrder(ploys) {
  let order = ['emotion', 'potential', 'belief','life','love' ]
  let newPloys = ploys.sort((a, b) => {
    return order.indexOf(a.category) - order.indexOf(b.category)
  })
  return newPloys
}

function selectedItems(answerIds, result) {
  const questions = result.data
  let new_q = questions.map((q) => {
    let an = q.answers.find(element => answerIds.includes(element._id) )
    q.selected = an
    return q
  })
  return new_q
}

function totalScore(questions) {
  const scores = questions.map((e) => e.selected.weight * e.weight / 100)
  const acc = (accumulator, currentValue) => accumulator + currentValue;
  const snum = scores.reduce(acc)
  return snum.toFixed(2)
}