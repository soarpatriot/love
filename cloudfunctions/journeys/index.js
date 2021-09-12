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
  let { OPENID} = cloud.getWXContext()
  console.log("openid: " + OPENID)
  const result = await db.collection('journeys').where({
    _openid: OPENID,
  }).orderBy('created_at', 'desc').get()
  
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

async function findJourneyAnswers(id) {
  
  const db = cloud.database()
  const _ = db.command
  const result = await db.collection('journeys').doc(id).get()
  const answerIds = result.data.answers


  let r = await db.collection('questions').where({
    "answers._id": _.in(answerIds)
  }).get()
  console.log("r: " + JSON.stringify(r))

  const rr = yourSelected(answerIds, r)
  // const questions = yourSelected(journeyAnswers, r.list)
  // const total_score = totalScore(questions)
  // const rs = {
  //   questions, questions,
  //   total_score: total_score
  // }
  return JSON.stringify(rr)
}

function yourSelected(answerIds, result){
  let questions = result.data
  let totalScore = 0
  for(let i=0; i< answerIds.length;  i++){
    let q = questions[i]
    let a = q.answers.find(element => element._id == answerIds[i] )
    q.selected = answerIds[i]
    totalScore = totalScore + itemScore(q.weight, a)
    console.log(itemScore(q.weight, a))
  }

  result = { data: questions, total_score:  totalScore.toFixed(2) }
  return result
}

function itemScore(qWeight, answer){
  return (qWeight * answer.weight / 100)
}

function totalScore(questions) {
  //const scores = questions.map((e) => e.selected * e.weight / 100; )

  const scores = questions.map((e) => e.selected.weight * e.weight / 100)
  const acc = (accumulator, currentValue) => accumulator + currentValue;
  const snum = scores.reduce(acc)
  return snum.toFixed(2)
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