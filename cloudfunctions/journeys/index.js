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
    case 'findJourneyAnswers': {
      return findJourneyAnswers(event.id)
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

async function findJourneyAnswers(id) {
  
  const db = cloud.database()
  const _ = db.command
  const result = await db.collection('journeys').doc(id).get()
  const journeyAnswers = result.data.answers
  const qIds = journeyAnswers.map((e) => { return e.q_id})

  const r = await db.collection('questions').aggregate()
  .match({_id: _.in(qIds)})
  .lookup({
    from: 'answers',
    localField: '_id',
    foreignField: 'question_id',
    as: 'answers'
  }).end()

  const questions = yourSelected(journeyAnswers, r.list)
  const total_score = totalScore(questions)
  const rs = {
    questions, questions,
    total_score: total_score
  }
  return JSON.stringify(rs)
}

function yourSelected(journeyAnswers, questionAnswers){
  return questionAnswers.map((e) => {
    const journey_question = journeyAnswers.find(element => element.q_id == e._id);
    const found = e.answers.find(element => element._id == journey_question.a_id );

    e.selected = found
    e.selected['full_score'] = 100
    e.selected['category'] = e.category
    return e
  })
}

function totalScore(questions) {
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