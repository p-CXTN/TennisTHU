// miniprogram/pages/draw/draw.js
const app = getApp()
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    enable:true,
    permit: 0,
    flag: false,
    rflag: true,
    dep1:"",
    ms11:"男一单",
    ms21:"男二单",
    ws1:"女单",
    d1:"男双",
    md1:"混双",
    dep2:"",
    ms12:"男一单",
    ms22:"男二单",
    ws2:"女单",
    d2:"男双",
    md2:"混双",
    id1:"",
    id2:"",
    id3:"",
    id4:"",
    id5:"",
    language: "中文",
  },

  onLoad: function(e){
    var lan = app.globalData.language;
    this.setData({
      language: lan
    })
    var lastLanuage = this.data.language;
    this.getContent(lastLanuage);

    this.setData({
      permit: app.globalData.permit
    })
    if (app.globalData.permit >= 4)
      this.setData({
        flag: true,
        rflag: false
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

  binddep1:function(e){
    if(e.detail.value == "")return;
    this.setData({
      dep1: e.detail.value
    })
  },
  bindms11:function(e){
    if(e.detail.value == "")return;
    this.setData({
      ms11: e.detail.value
    })
  },
  bindms21:function(e){
    if(e.detail.value == "")return;
    this.setData({
      ms21: e.detail.value
    })
  },
  bindws1:function(e){
    if(e.detail.value == "")return;
    this.setData({
      ws1: e.detail.value
    })
  },
  bindd1:function(e){
    if(e.detail.value == "")return;
    this.setData({
      d1: e.detail.value
    })
  },
  bindmd1:function(e){
    if(e.detail.value == "")return;
    this.setData({
      md1: e.detail.value
    })
  },
  binddep2:function(e){
    if(e.detail.value == "")return;
    this.setData({
      dep2: e.detail.value
    })
  },
  bindms12:function(e){
    if(e.detail.value == "")return;
    this.setData({
      ms12: e.detail.value
    })
  },
  bindms22:function(e){
    if(e.detail.value == "")return;
    this.setData({
      ms22: e.detail.value
    })
  },
  bindws2:function(e){
    if(e.detail.value == "")return;
    this.setData({
      ws2: e.detail.value
    })
  },
  bindd2:function(e){
    if(e.detail.value == "")return;
    this.setData({
      d2: e.detail.value
    })
  },
  bindmd2:function(e){
    if(e.detail.value == "")return;
    this.setData({
      md2: e.detail.value
    })
  },

  reverse:function(){
    var temp; var that = this;
    temp=that.data.dep2;that.setData({dep2: that.data.dep1});that.setData({dep1: temp});
    temp=that.data.ms12;that.setData({ms12: that.data.ms11});that.setData({ms11: temp});
    temp=that.data.ms22;that.setData({ms22: that.data.ms21});that.setData({ms21: temp});
    temp=that.data.ws2;that.setData({ws2: that.data.ws1});that.setData({ws1: temp});
    temp=that.data.d2;that.setData({d2: that.data.d1});that.setData({d1: temp});
    temp=that.data.md2;that.setData({md2: that.data.md1});that.setData({md1: temp});
  },

  judgereverse: async function(){
    const db = wx.cloud.database();
    var that = this;
    return new Promise((resolve,reject)=>{
      db.collection('match').where({
        dep1: that.data.dep1,
        dep2: that.data.dep2
      }).get({
        success:function(res){
          console.log(res);
          if(res.data.length==0)that.reverse();
          resolve();
        }
      })
    }).catch((e) => {})
  },

  getmatchid1: async function(){
    const db = wx.cloud.database();
    var that = this;
    return new Promise((resolve,reject)=>{
      db.collection('match').where({
        dep1: that.data.dep1,
        dep2: that.data.dep2,
        subject: "一单"
      }).get({
        success:function(res){
          console.log(res);
          if(res.data.length == 0){
            that.data.enable = true;
            resolve();
          }
          that.setData({
            id1: res.data[0]._id
          })
          resolve();
        }
      })
    }).catch((e) => {})
  },
  getmatchid2: async function(){
    const db = wx.cloud.database();
    var that = this;
    return new Promise((resolve,reject)=>{
      db.collection('match').where({
        dep1: that.data.dep1,
        dep2: that.data.dep2,
        subject: "二单"
      }).get({
        success:function(res){
          if(res.data.length == 0){
            that.data.enable = true;
            resolve();
          }
          that.setData({
            id2: res.data[0]._id
          })
          console.log(res);
          resolve();
        }
      })
    }).catch((e) => {})
  },
  getmatchid3: async function(){
    const db = wx.cloud.database();
    var that = this;
    return new Promise((resolve,reject)=>{
      db.collection('match').where({
        dep1: that.data.dep1,
        dep2: that.data.dep2,
        subject: "女单"
      }).get({
        success:function(res){
          if(res.data.length == 0){
            that.data.enable = true;
            resolve();
          }
          that.setData({
            id3: res.data[0]._id
          })
          console.log(res);
          resolve();
        }
      })
    }).catch((e) => {})
  },
  getmatchid4: async function(){
    const db = wx.cloud.database();
    var that = this;
    return new Promise((resolve,reject)=>{
      db.collection('match').where({
        dep1: that.data.dep1,
        dep2: that.data.dep2,
        subject: "男双"
      }).get({
        success:function(res){
          if(res.data.length == 0){
            that.data.enable = true;
            resolve();
          }
          that.setData({
            id4: res.data[0]._id
          })
          console.log(res);
          resolve();
        }
      })
    }).catch((e) => {})
  },
  getmatchid5: async function(){
    const db = wx.cloud.database();
    var that = this;
    return new Promise((resolve,reject)=>{
      db.collection('match').where({
        dep1: that.data.dep1,
        dep2: that.data.dep2,
        subject: "混双"
      }).get({
        success:function(res){
          if(res.data.length == 0){
            that.data.enable = true;
            resolve();
          }
          that.setData({
            id5: res.data[0]._id
          })
          console.log(res);
          resolve();
        }
      })
    }).catch((e) => {})
  },

  submit1: async function(){
    const db = wx.cloud.database();
    var that = this;
    return new Promise((resolve,reject)=>{
      console.log(that.data.id1)
        if(that.data.id1==undefined)
        {
          that.setData({
            enable:true
          })
        }
        else db.collection('match').doc(that.data.id1).update({
          data:{
            player1: that.data.ms11,
            player2: that.data.ms12
          },
          success:function(res){
            resolve();
          }
        })
    }).catch((e) => {})
  },
  submit2: async function(){
    const db = wx.cloud.database();
    var that = this;
    return new Promise((resolve,reject)=>{
      console.log(that.data.id2)
        if(that.data.id2==undefined)
        {
          that.setData({
            enable:true
          })
        }
        else db.collection('match').doc(that.data.id2).update({
          data:{
            player1: that.data.ms21,
            player2: that.data.ms22
          },
          success:function(res){
            resolve();
          }
        })
    }).catch((e) => {})
  },
  submit3: async function(){
    const db = wx.cloud.database();
    var that = this;
    return new Promise((resolve,reject)=>{
      console.log(that.data.id3)
        if(that.data.id3==undefined)
        {
          that.setData({
            enable:true
          })
        }
        else db.collection('match').doc(that.data.id3).update({
          data:{
            player1: that.data.ws1,
            player2: that.data.ws2
          },
          success:function(res){
            resolve();
          }
        })
    }).catch((e) => {})
  },
  submit4: async function(){
    const db = wx.cloud.database();
    var that = this;
    return new Promise((resolve,reject)=>{
      console.log(that.data.id4)
        if(that.data.id4==undefined)
        {
          that.setData({
            enable:true
          })
        }
        else db.collection('match').doc(that.data.id4).update({
          data:{
            player1: that.data.d1,
            player2: that.data.d2
          },
          success:function(res){
            resolve();
          }
        })
    }).catch((e) => {})
  },
  submit5: async function(){
    const db = wx.cloud.database();
    var that = this;
    return new Promise((resolve,reject)=>{
      console.log(that.data.id5)
        if(that.data.id5==undefined)
        {
          that.setData({
            enable:true
          })
        }
        else db.collection('match').doc(that.data.id5).update({
          data:{
            player1: that.data.md1,
            player2: that.data.md2
          },
          success:function(res){
            resolve();
          }
        })
    }).catch((e) => {})
  },
  naviback: async function(){
    var that = this;
    return new Promise((resolve,reject)=>{
      if(!that.data.enable)
      wx.showModal({
        title:'提示',
        content:'对阵表提交成功',
        showCancel:false,
        complete:function(res){
          wx.navigateBack({
            complete: (res) => {resolve();},
          })
        }
      })
      
    }).catch((e) => {})
  },

  submit:async function(e){
    console.log(this.data)
    var that = this;
    await wx.showLoading({
      title: '处理中',
    })
    that.setData({
      enable:false
    })
    await that.judgereverse();
    await Promise.all([that.getmatchid1(),that.getmatchid2(),that.getmatchid3(),that.getmatchid4(),that.getmatchid5()]);
    if(that.data.enable){
      wx.showModal({
        title: '错误',
        content: "没有找到对应院系的比赛",
        showCancel: false,
        success:function(res){
          wx.hideLoading({
            success: (res) => {
              that.setData({
                enable: true
              })
              return;
            },
          })
        }
      })
    }
    await Promise.all([that.submit1(),that.submit2(),that.submit3(),that.submit4(),that.submit5()]);
    wx.hideLoading({
      success: (res) => {that.naviback();},
    })
  }
})