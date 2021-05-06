// miniprogram/pages/signup/signup.js
const app = getApp();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
var date = require("../../utils/Date.js")

Page({
  data: {
    currentYear:2021,
    currentMonth:1,
    currentDay:1,
    nomatch: true,
    dataList:{},
    match: {},
    language: '中文',
    
    avatarUrl: '../../images/noneuser.png',
    realname:"",
    nickname: "",
    signupid: "",
    signuplevel: "",
    signedup: false,
  },

  onShow: function(options){
    const db = wx.cloud.database();
    var that = this;
    wx.showLoading({
      title: 'Loading',
    })
    db.collection('matches').where({
      openforreg: true
    }).get({
      success:function(res){
        console.log(res)
        if(res.data.length==0)
        that.setData({
          nomatch: true
        })
        else 
        that.setData({
          match: res.data[0],
          nomatch: false
        })
      }
    })
    db.collection('signupdata').where({
      realname: that.data.realname,
      matchname: that.data.match.name
    }).get({
      success: function(res){
        wx.hideLoading({})
        if(res.data.length == 0){

        } else {
          that.setData({
            signedup: true,
            signupid: res.data[0]._id,
            signuplevel: res.data[0].level,
          })
        }
      }
    })
  },
  onLoad: async function (options) {
    const db = wx.cloud.database();
    var that = this;
    var lan = app.globalData.language;
    wx.showLoading({
      title: 'Loading',
    })
    this.setData({
      language: lan
    })
    var lastLanuage = this.data.language;
    this.getContent(lastLanuage);

    await new Promise((resolve,reject)=>{
      if(app.globalData.avatarUrl==="index/user-unlogin.png"){
        wx.showModal({
          title: that.data.content.modalwarning,
          content: that.data.content.reqlogin,
          showCancel: false,
          success: function(res){
            wx.navigateBack({
              delta: 1,
            })
          }
        })
      }
      resolve();
    }).catch((e) => {})
   

    this.setData({
      avatarUrl: app.globalData.avatarUrl,
      realname: app.globalData.realname,
      currentYear: date.formatYear(new Date()),
      currentMonth: date.formatMonth(new Date()),
    })

    db.collection('matches').where({
      openforreg: true
    }).get({
      success:function(res){
        if(res.data.length==0)
        that.setData({
          nomatch: true
        })
        else 
        that.setData({
          match: res.data[0],
          nomatch: false
        })
/*
        for(let i=0,j=0;i<res.data.length;i++)
        {
          if (res.data[i].year < that.data.currentYear) continue;
          else if (res.data[i].month < that.data.currentMonth && res.data[i].year == that.data.currentYear) continue;
          var string="dataList["+j+"]";
          var string2=res.data[i];
          that.setData({
            [string]: string2
          })
          j++;
        }*/
      }
    })

    db.collection('signupdata').where({
      realname: that.data.realname,
      matchname: that.data.match.name
    }).get({
      success: function(res){
        wx.hideLoading({})
        if(res.data.length == 0){

        } else {
          that.setData({
            signedup: true,
            signupid: res.data[0]._id
          })
        }
      }
    })
  },
  bindmoreinfo: function(e){
    app.globalData.matchtitle = e.currentTarget.id;
    wx.navigateTo({
      url: '../moreinfo/moreinfo',
    })
  },
  
  bindsignup: function(e){
    var that = this;
    const db = wx.cloud.database();
    if(that.data.match.placesleft_A<=0 && that.data.match.placesleft_B<=0){
      wx.showModal({
        title: that.data.content.modalwarning,
        content: that.data.content.nodrawbutsubscribe,
        showCancel: true,
        success: function(res){
          if(res.cancel)return;
          wx.requestSubscribeMessage({
            tmplIds: ["h__qQplwsiqlOMudaRQS-b4Ks4o-4DcPHKQuPRlAMyA"],
            success: async function(res){
                if(res["h__qQplwsiqlOMudaRQS-b4Ks4o-4DcPHKQuPRlAMyA"] !=="accept")return;
                var timestamp = date.formatTime(new Date());
                db.collection('drawsubscribers').add({
                  data:{
                    match: that.data.match.name,
                    timestamp: timestamp
                  },
                  success: function(res){
                    wx.showModal({
                      title: that.data.content.modalhint,
                      content: that.data.content.subscribereqadded,
                      showCancel: false,
                    })
                  }
                })
              }
          })
        }
      })
    } else {
      app.globalData.imatch = this.data.match;
      wx.navigateTo({
        url: '../apply/apply',
      })
    }
  },

  bindcancelsignup:async function(e){
    var that = this;
    const db = wx.cloud.database();
    
    wx.showModal({
      title: that.data.content.modalwarning,
      content: that.data.content.cancelsignupq,
      showCancel: true,
      success: async function(res){
        if(res.cancel){
          return;
        } else if(res.confirm){
          wx.showLoading({
            title: 'Loading',
          })
          var match = that.data.match;
          await new Promise((resolve,reject)=>{
            db.collection('signupdata').doc(that.data.signupid).get({
              success:function(res){
                that.setData({
                  signuplevel: res.data.level
                })
                resolve();
              }
            })
          })
          await new Promise((resolve,reject)=>{
            db.collection('signupdata').doc(that.data.signupid).remove({
              success: function(res){
                resolve();
              }
            });
          }).catch((e) => {})
          await new Promise((resolve,reject)=>{
            var string = "placesleft_" + that.data.signuplevel;
            console.log(string)
            db.collection('matches').doc(that.data.match._id).update({
              data:{
                [string]: db.command.inc(1)
              },
              success: function(res){
                resolve()
              }
            })
          }).catch((e) => {})
          that.setData({
            signupid: "",
            signedup: false,
          })
          await that.sendmessage();
          wx.hideLoading({});
          wx.showModal({
            title: that.data.content.modalhint,
            content: that.data.content.cancelsignupsuccess,
            showCancel: false,
            success: function(){
              db.collection('matches').doc(that.data.match._id).get({
                success: function(res){
                  that.setData({
                    match: res.data
                  })
                }
              })
            }
          })
        }
      }
    })
  },

  sendmessage: async function(){
    console.log("sending messages")
    var that = this;
    const db = wx.cloud.database();
    var susers;
    var usernum = 0;
    await new Promise((resolve,reject)=>{
      db.collection('drawsubscribers').get({
        success:function(res){
          console.log(res)
          usernum = res.data.length;
          susers = res.data
          resolve();
        }
      })
    })
    console.log(usernum,susers)
    if(usernum == 0)return;
    for(var i=0;i<usernum;i++){
      console.log(susers[i])
      await new Promise((resolve,reject)=>{
        wx.cloud.callFunction({
          name: "senddrawmsg",
          data: {
            _openid: susers[i]._openid,
            matchname: susers[i].match
          },
          success: function(res){
            db.collection('drawsubscribers').doc(susers[i]._id).remove();
            resolve();
          }
        })
      })
    }
    
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
  }
})