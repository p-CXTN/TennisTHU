// miniprogram/pages/enterscore/enterscore.js
const app = getApp();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
var date = require("../../utils/Date.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num: [0,0,31,60,91,121,152,182,213,244,274,305,335,366],
    winner: 0,
    subject: "一单",
    searched: false,
    language: "中文",
    dep1:"",
    dep2:"",
    score1:0,
    score2:0,
    box1checked:false,
    box2checked:false,
    subjectarray:["一单","二单","女单","男双","混双"],
    statusarray:["FT","Nor","W.O.","Ret.","Def.","Del.","Int.","Can."],
    statusindex:0,
    status:"FT",
    subjectindex:0,
    imatch:{},
    days:"0",
    found: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var lan = app.globalData.language;
    this.setData({
      language: lan
    })
    var lastLanuage = this.data.language;
    this.getContent(lastLanuage);

    var days = String( this.data.num[date.formatMonth(new Date())] + date.formatDay(new Date()) ) ;
    this.setData({
      days: days
    })
  },
  getContent: function (lastLanuage) {
    if (lastLanuage == "中文") {
      this.setData({
        content: chinese.content,
      })
    } else {
      this.setData({
        content: english.content
      })
    }
  },
  getstatus:function(e){
    var temp = this.data.statusarray[e.detail.value];
    this.setData({
      statusindex:e.detail.value,
      status: temp
    })
  },
  binddep1:function(e){
    this.setData({
      dep1: e.detail.value
    })
  },
  binddep2:function(e){
    this.setData({
      dep2: e.detail.value
    })
  },
  getsubject:function(e){
    var temp = this.data.subjectarray[e.detail.value];
    this.setData({
      subjectindex:e.detail.value,
      subject: temp
    })
  },
  getscore1:function(e){
    if(e.detail.value=="")return;
    this.setData({
      score1: e.detail.value
    })
  },
  getscore2:function(e){
    if(e.detail.value=="")return;
    this.setData({
      score2: e.detail.value
    })
  },
  search:async function(){
    const db = wx.cloud.database();
    var that=this;
    console.log(that.data.days,that.data.subject,that.data.dep1,that.data.dep2)
    await Promise.all([new Promise((resolve,reject)=>{
      db.collection('match').where({
        subject: that.data.subject,
        dep1: that.data.dep2,
        dep2: that.data.dep1,
        date: that.data.days
      }).get({
        success:function(res){
          console.log(res)
          if(res.data.length!=0)that.setData({
            imatch: res.data[0],
            found: true
          })
          resolve();
        }
      })
    }).catch((e) => {}),
    new Promise((resolve,reject)=>{
      db.collection('match').where({
        subject: that.data.subject,
        dep1: that.data.dep1,
        dep2: that.data.dep2,
        date: that.data.days
      }).get({
        success:function(res){
          console.log(res)
          if(res.data.length!=0)that.setData({
            imatch: res.data[0],
            found: true
          })
          resolve();
        }
      })
      }).catch((e) => {})
    ])
    if(that.data.found){
      await new Promise((resolve,reject)=>{
        that.setData({
          searched:true
        })
        var timestring = String(parseInt(parseInt(that.data.imatch.time)/100));
        timestring += ":";
        timestring += (parseInt(that.data.imatch.time)%100/10 < 1)?
                ("0"+String(parseInt(that.data.imatch.time)%100)):
                String(parseInt(that.data.imatch.time)%100);
        var string = "imatch.time";
        that.setData({
          [string]: timestring
        })

        console.log(that.data.imatch)
      }).catch((e) => {})
    }
    else return;
  },
  checkboxchange:function(e){
    if(e.detail.value[1]=="1")
    {
      this.setData({
        box1checked:true,
        box2checked:false,
        winner:1
      })
    }
    else if(e.detail.value[1]=="2")
    {
      this.setData({
        box1checked:false,
        box2checked:true,
        winner:2
      })
    }
    else if(e.detail.value[0]=="1"){
      this.setData({
        box1checked:true,
        box2checked:false,
        winner:1
      })
    }
    else{
      this.setData({
        box1checked:false,
        box2checked:true,
        winner:2
      })
    }
  },
  submit:async function(){
    var that = this;
    const db = wx.cloud.database();
    var string = that.data.imatch._id;
    await new Promise((resolve,reject)=>{
      db.collection("match").doc(string).update({
        data:{
          status: that.data.status,
          score1: that.data.score1,
          score2: that.data.score2,
          winner: that.data.winner
        },success:function(res){
          console.log(res);
          resolve();
        }
      })
    }).catch((e) => {})
    wx.showModal({
      title:'提示',
      content:'比分提交成功',
      showCancel:false,
      complete:function(res){
        wx.navigateBack({
          complete: (res) => {},
        })
      }
    })
    
  }
})