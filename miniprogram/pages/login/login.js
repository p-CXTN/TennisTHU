// miniprogram/pages/login/login.js
const app = getApp()
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userid:"",
    pwd:"",
    found: false
  },

  onLoad: function(){
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

  syncid: function (e) {
    this.setData({
      userid: e.detail.value
    })
  },

  syncpwd: function (e) {
    this.setData({
      pwd: e.detail.value
    })
  },

  submit: async function () {
    const db = wx.cloud.database();
    var that=this;
    var t_stuid = this.data.userid , t_pwd=this.data.pwd;
    console.log(t_pwd,t_stuid);

    wx.showLoading({mask: true});
    await new Promise((resolve,reject)=>{
      db.collection('users').where({
        stuid: t_stuid
      })
      .get({
        success: function(res) {
          if(res.data.length == 0)resolve();
          if(res.data[0].password == t_pwd)
          {
            var temp2 = app.globalData.nickName;
            var temp3 = app.globalData.avatarUrl;
            var temp = res.data[0]._id;
            app.globalData.logged = true;
            wx.cloud.callFunction({
              name: 'updateuser',
              data:{
                _id: temp,
                nickn: temp2,
                avturl: temp3
              },
              success: function(e){
                that.setData({
                  found: true
                })
                wx.hideLoading({});
                console.log("用户信息更新")
                resolve();
              }
            })
          }
          else
          {
            wx.hideLoading({});
            wx.showModal({
              content: '密码错误！',
              showCancel: false
            })
          }
        },
        fail: err => {
          console.log('查询用户 失败')
          wx.hideLoading({});
          wx.showModal({
            title: '提示',
            content: '查询用户失败，请稍后重试',
            showCancel: false
          })
        }
      })
    }).catch((e) => {})

    await new Promise((resolve,reject)=>{
      if (that.data.found==false) {
        wx.hideLoading({});
        wx.showModal({
          title: '提示',
          content: '用户不存在！请注册',
          confirmText: "去注册",
          success: function (e) {
            if (e.cancel) { 
              resolve();
            } else {
              resolve();
              wx.reLaunch({
                url: '../getUserInfo/getUserInfo',
              })
            }
          }
        })
      }
      else resolve();
    }).catch((e) => {})

    if(that.data.found){
      wx.hideLoading({});
      wx.showModal({
      title: '提示',
      content: '请在新页面重新登陆！Please log in again!',
      showCancel: false,
      complete (res){
        wx.reLaunch({
          url: '../index/index',
        })
      }
    })}
  },

  getuserinfo: function(){
    wx.reLaunch({
      url: '../getUserInfo/getUserInfo',
    })
  }
})