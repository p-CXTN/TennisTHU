// miniprogram/pages/resetPwd/resetPwd.js
const app = getApp()
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name:"",
    stuid:"",
    phoneno:"",
    newpwd:"",
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
  syncname: function(e){
    var that = this;
    if(e.detail.value != "")
    that.setData({
      name: e.detail.value
    })
  },
  syncstuid: function(e){
    var that = this;
    if(e.detail.value != "")
    that.setData({
      stuid: e.detail.value
    })
  },
  syncphone: function(e){
    var that = this;
    if(e.detail.value != "")
    that.setData({
      phoneno: e.detail.value
    })
  },
  syncpwd: function(e){
    var that = this;
    if(e.detail.value != "")
    that.setData({
      newpwd: e.detail.value
    })
  },
  submit: async function(){
    console.log(this.data)
    wx.showLoading({});
    const db = wx.cloud.database();
    var that = this;
    console.log(that.data.name,that.data.stuid,that.data.phoneno,that.data.newpwd,app.globalData.nickName,app.globalData.avatarUrl)
    await new Promise((resolve,reject)=>{
      db.collection('resetPwdReq').add({
        data:{
          realname: that.data.name,
          stuid: that.data.stuid,
          phoneno: that.data.phoneno,
          newpwd: that.data.newpwd,
          nickName: app.globalData.nickName,
          avatarUrl: app.globalData.avatarUrl
        },
        success: function(res){
          wx.hideLoading({
            success: (res) => {},
          })
          wx.showModal({
            title: "提示",
            content: "申请提交成功",
            showCancel: false,
            complete (res){
              resolve();
            }
          })
        }
      })
    }).catch((e) => {})
    wx.reLaunch({
      url: '../index/index',
    })
  }
})