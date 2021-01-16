// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  switch (event.action) {
    case 'addJourney': {
      return addJourney(event.entity)
    }
    case 'findJourney': {
      return findJourney(event.id)
    }
    default: {
      return
    }
  }

}

async function addJourney(entity) {
  const db = cloud.database()
  
  const j = await db.collection('journeys').add({
    data: entity
  })
  console.log("journeys: " + j)
  return JSON.stringify(j)
}

async function findJourney(id) {
  const db = cloud.database()
  const _ = db.command
  const result = await db.collection('journeys').doc(id).get()
  const journeyAnswers = result.data.answers
  const aIds = journeyAnswers.map((e) => { return e.a_id})
  const qIds = journeyAnswers.map((e) => { return e.q_id})

  // const questions = await db.collection('questions').where(
  //   {
  //     _id: _in(qIds)
  //   }
  // ).get()

  // const answers = await db.collection('answers').where(
  //   {
  //     _id: _in(aIds)
  //   }
  // ).get()

  const answersRaw = await db.collection('answers')
  .aggregate()
  .match({_id: _.in(aIds)})

  .lookup({
    from: 'questions',
    localField: 'question_id',
    foreignField: '_id',
    as: 'question'
  }).end()

  let mergeQuestion = (e) => {
    e.question = e.question[0]
    return e
  }
  const answers = answersRaw.list.map(mergeQuestion)
  const s = scores(answers)
  const re = generte(s)
  return JSON.stringify(re)
}

function scores(answers) {
  return answers.map((e) => {
    return {
      _id: e._id,
      weight: e.weight,
      category: e.question.category
    }
  })
}

function generte(scores) {
  let re = {}
  scores.forEach((e) => {
    re[e.category] = e
  })

  return re
}