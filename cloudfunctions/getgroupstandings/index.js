// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const countResult = await db.collection('groupStandings').count()
  const count = countResult.total
  if(count==0)return {errMsg:"NODATA"}
  const batchtimes = Math.ceil(count/100);
  const tasks = [];
  for(let i=0;i<batchtimes;i++){
    const promise = db.collection('groupStandings').skip(i*100).limit(100).get()
    tasks.push(promise);
  }
  return (await Promise.all(tasks)).reduce((acc,cur)=>{
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg
    }
  })
}