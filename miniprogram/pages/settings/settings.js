// miniprogram/pages/settings/settings.js
const app = getApp();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    language: "中文"
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

  logout: function (e) {
    var temp = app.globalData.cloudid;
    console.log(temp);
    wx.cloud.callFunction({
      name: 'logout',
      data: {
        _id: temp
      },
      success: function (e) {
        console.log("杀了")
        wx.reLaunch({
          url: '../index/index',
        })
      }
    })
  },

  changepwd: function (e) {
    wx.showModal({
      title: '提示',
      content: '暂时不支持修改密码！',
      showCancel: false
    })
  },

  deleteuser: function (e) {
    var that = this;
    const db = wx.cloud.database();
    var proceed = false;
    if (!app.globalData.logged) {
      wx.showModal({
        title: that.data.content.modalwarning,
        content: that.data.content.reqlogin,
        showCancel: false,
        success: function (res) {
          proceed = false;
        }
      })
    } else proceed = true;
    if (!proceed) return;
    else wx.showModal({
      title: that.data.content.modalwarning,
      content: that.data.content.deleteuserwarning,
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          db.collection('users').where({
            nickname: app.globalData.nickName,
            avatarurl: app.globalData.avatarUrl
          }).get({
            success: async function (res) {
              if (res.data.length == 0) {
                wx.showModal({
                  title: that.data.content.modalwarning,
                  content: "Internal Error, try again later",
                  showCancel: false
                })
              } else {
                var userinfo = res.data[0];
                var userid = "void";
                console.log(userinfo._openid, userinfo._id)
                await new Promise((resolve, reject) => { db.collection('2020F').where({ _openid: userinfo._openid }).get({ success: function (res) { if(res.data.length != 0) userid = res.data[0]._id; resolve(); } }) }).catch((e) => { })
                console.log(userid)
                if(userid !=="void")await new Promise((resolve, reject) => { db.collection('2020F').doc(userid).remove({ success: function (res) { resolve(); } }) }).catch((e) => { })
                userid = "void";
                await new Promise((resolve, reject) => { db.collection('2021S').where({ _openid: userinfo._openid }).get({ success: function (res) { if(res.data.length != 0) userid = res.data[0]._id; resolve(); } }) }).catch((e) => { })
                console.log(userid)
                if(userid !=="void")await new Promise((resolve, reject) => { db.collection('2021S').doc(userid).remove({ success: function (res) { resolve(); } }) }).catch((e) => { })
                userid = "void";
                await new Promise((resolve, reject) => { db.collection('signupdata').where({ _openid: userinfo._openid }).get({ success: function (res) { if(res.data.length != 0) userid = res.data[0]._id; resolve(); } }) }).catch((e) => { })
                console.log(userid)
                if(userid !=="void")await new Promise((resolve, reject) => { db.collection('signupdata').doc(userid).remove({ success: function (res) { resolve(); } }) }).catch((e) => { })
                await new Promise((resolve, reject) => { db.collection('users').doc(userinfo._id).remove({ success: function (res) { resolve(); } }) }).catch((e) => { })
              }
            }
          })
        }
      }
    })
  }

})