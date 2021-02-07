// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    return await db.collection("match").doc(event._id).update({
      data: {
        gender: event.gender,
        rating: event.rating,
        school: event.school,
        department: event.department,
        grade: event.grade,
        phone: event.phone,
        phand: event.phand,
        bhand: event.bhand
      }
    })
  } catch (e) {
    console.error(e)
  }
}