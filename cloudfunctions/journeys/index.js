// 云函数入口文件
const cloud = require('wx-server-sdk')
const timeago = require('timeago.js')

const loveDict = {
  lose: '长痛不如短痛',
  failed: '纠结的过程',
  normal: '平淡的日子',
  happy: '确信的小幸福',
  soul: '灵魂伴侣'
}
  

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
    case 'findJourneyAnswers': {
      return findJourneyAnswers(event.id)
    }
    case 'unblock': {
      return unblock(event.id)
    }
    default: {
      return
    }
  }

}

async function unblock(id) {
  const db = cloud.database()
  const _ = db.command
  let { OPENID} = cloud.getWXContext()

  const result = db.collection('journeys').where({
    _openid: _.neq(OPENID),
    _id: _.eq(id)
  }).update({
    data: {
      unblocked: true
    }
  })
  return JSON.stringify(result)
}

async function my() {
  const db = cloud.database()
  const $ = db.command.aggregate
  const _ = db.command
  let { OPENID} = cloud.getWXContext()
  let result = await db.collection('journeys').aggregate()
  .match({
    _openid: OPENID
  })
  .sort({
    created_at: -1
  }).end()
  //console.log(JSON.stringify(result.list))
  result.list = formatTime(result.list)

  //const answerIds = connectAnswers(result.list)



  //const aList = connectAnswers(r.list)


  result.list = await addSummary(result.list)
  //console.log(JSON.stringify(result))
  return JSON.stringify(result)
}

async function addJourney(entity) {
  const db = cloud.database()
  let { OPENID} = cloud.getWXContext()

  entity._openid = OPENID
  entity.created_at = db.serverDate()
  const j = await db.collection('journeys').add({
    data: entity
  })
  
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
    "journey": result.data,
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

function formatTime(list) {
  return list.map((e) => {
    e.ago = timeago.format(e.created_at.getTime(), 'zh_CN')
    return e
  })
}



async function addSummary(journeys) {
  //const answerIds = connectAnswers(journeys)
  let ansResult = null;
  for(let i=0; i < journeys.length; i++ ) {
    ansResult = await journeyAnswers(journeys[i].answers)
    let ansObjArr = ansResult.list.pop()
    let loveAnswer = ansObjArr.answers.pop()
    let summary = loveMapping(loveAnswer.weight)

    journeys[i].summary = summary
  }

  return journeys;
}

// function cross(answerIds, answers) {
//    let a = answers.filter(x => answerIds.some(y => y === x._id))
//    console.log(a)
//    return a[0]
// }

// function connectAnswers(list) {
//   let as = []
//   list.forEach(a => {
//     as = as.concat(a.answers)
//   })

//   return as
// }

async function journeyAnswers(answerIds) {
  const db = cloud.database()
  const $ = db.command.aggregate
  const _ = db.command
  const r = await db.collection('questions').aggregate()
    .match({
      category: _.eq('love'),
      answers: _.elemMatch({
        _id: _.in(answerIds)
      })
    }).project({
      answers: $.filter({
        input: '$answers',
        as: 'item',
        cond: $.in(['$$item._id', answerIds])
      })
    })
    .end()

    return r
}


function loveMapping(score) {
  let s = ''
  switch (true) {
    case score >= 85: {
      s = loveDict['soul']
      break
    }
    case score >= 75:  {
      s = loveDict['happy']
      break
    }
    case score >= 60:  {
      s = loveDict['normal']
      break
    }
    case score >= 50:  {
      s = loveDict['failed']
      break
    }
    default:  {
      s = loveDict['lose']
      break
    }
  }
  return s
}