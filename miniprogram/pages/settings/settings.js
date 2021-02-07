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

  logout: function(e){
    var temp = app.globalData.cloudid;
    console.log(temp);
    wx.cloud.callFunction({
      name: 'logout',
      data: {
        _id: temp
      },
      success:function(e){
        console.log("杀了")
      }
    })
    wx.reLaunch({
      url: '../index/index',
    })
  },

  changepwd:function(e){
    wx.showModal({
      title: '提示',
      content: '暂时不支持修改密码！',
      showCancel: false
    })
  }

})