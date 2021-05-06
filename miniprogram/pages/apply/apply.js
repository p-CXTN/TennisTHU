// miniprogram/pages/apply/apply.js
const app = getApp();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
var utiltime = require("../../utils/Date.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    language: "中文",
    imatch: {},
    avatarUrl: "",
    realname: "",
    gender: "男",
    phone: "0",
    grade: "0",
    department: "未指定",
    stuid: "0",
    wechatid: "",
    needwechat: false,
    userid: "",
    ratingindex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const db = wx.cloud.database();
    var that = this;
    var lan = app.globalData.language;
    var needwechat = false;
    if (app.globalData.wechatid === "") needwechat = true;
    this.setData({
      needwechat: needwechat,
      language: lan,
      imatch: app.globalData.imatch,
      avatarUrl: app.globalData.avatarUrl,
      realname: app.globalData.realname
    })
    var lastLanuage = this.data.language;
    this.getContent(lastLanuage);

    var nickn = app.globalData.nickName;
    var avturl = app.globalData.avatarUrl;
    db.collection("users").where({
      nickname: nickn,
      avatarurl: avturl
    }).get({
      success: function (res) {
        that.setData({
          userid: res.data[0]._id,
          realname: res.data[0].realname,
          gender: res.data[0].gender,
          phone: res.data[0].phone,
          grade: res.data[0].grade,
          department: res.data[0].department,
          stuid: res.data[0].stuid,
          wechatid: res.data[0].wechatid
        })
      }
    })

    db.collection("matches").doc(that.data.imatch._id).get({
      success: function (res) {
        that.setData({
          imatch: res.data
        })
      }
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
  getRating: function(res){
    console.log(res)
    this.setData({
      ratingindex: parseInt(res.detail.value)
    })
  },
  bindsignup: async function () {
    var that = this;
    const db = wx.cloud.database();
    var finalplacesleft_A = 0, finalplacesleft_B = 0;
    await new Promise((resolve, reject) => {
      db.collection('matches').doc(that.data.imatch._id).get({
        success: function (res) {
          finalplacesleft_A = res.data.placesleft_A;
          finalplacesleft_B = res.data.placesleft_B;
          resolve();
        }
      })
    })

    if ((that.data.ratingindex == 0 && finalplacesleft_A <= 0) || (that.data.ratingindex == 1 && finalplacesleft_B <= 0)) {
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
      /*wx.showModal({
        title: that.data.content.modalwarning,
        content: that.data.content.nodraw,
        showCancel: false,
        success: function(res){

          wx.navigateBack({
            delta: 1,
          })
        }
      })*/
    } else {
      wx.showLoading({
        title: 'Loading',
      })
      if (that.data.needwechat) {
        db.collection('users').doc(that.data.userid).update({
          data: {
            wechatid: that.data.wechatid
          }
        })
      }
      if (that.data.needwechat && that.data.wechatid === "") {
        wx.hideLoading({})
        wx.showModal({
          title: that.data.content.modalwarning,
          content: that.data.content.completepersonalinfo,
          showCancel: false,
          confirmText: that.data.content.confirmtext,
        })
        return;
      }
      wx.hideLoading({});
      wx.showModal({
        title: that.data.content.modalhint,
        content: that.data.content.warningaboutresign,
        showCancel: true,
        success: async function (res) {
          if (res.cancel) {
            return;
          } else if (res.confirm) {
            var timestamp = utiltime.formatTime(new Date());
            var level = that.data.ratingindex==0?"A":"B";
            await new Promise((resolve, reject) => {
              db.collection("signupdata").add({
                data: {
                  realname: that.data.realname,
                  gender: that.data.gender,
                  phone: that.data.phone,
                  stuid: that.data.stuid,
                  matchname: that.data.imatch.name,
                  dep: that.data.department,
                  grade: that.data.grade,
                  wechat: that.data.wechatid,
                  level: level,
                  timestamp: timestamp
                },
                success: function (res) {
                  resolve();
                }
              })
            }).catch((e) => { })
            await new Promise((resolve, reject) => {
              if(that.data.ratingindex==0){
                db.collection("matches").doc(that.data.imatch._id).update({
                  data: {
                    placesleft_A: db.command.inc(-1)
                  },
                  success: function (res) {
                    resolve();
                  }
                })
              } else if(that.data.ratingindex==1) {
                db.collection("matches").doc(that.data.imatch._id).update({
                  data: {
                    placesleft_B: db.command.inc(-1)
                  },
                  success: function (res) {
                    resolve();
                  }
                })
              }
              
            }).catch((e) => { })
            wx.hideLoading({})
            wx.showModal({
              title: that.data.content.modalhint,
              content: that.data.content.signupsuccess,
              showCancel: false,
              success: function (res) {
                wx.navigateBack({
                  delta: 1,
                })
              }
            })
          }
        }
      })
    }
  },
  getwechatid: function (e) {
    this.setData({
      wechatid: e.detail.value
    })
  },
})