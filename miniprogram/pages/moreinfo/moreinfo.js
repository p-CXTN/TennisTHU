// miniprogram/pages/moreinfo/moreinfo.js
const app = getApp();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    matchinfo: {},
    language: '中文',
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

    var that = this;
    var mtitle = app.globalData.matchtitle;
    const db = wx.cloud.database();
    db.collection("matches").where({
      title: mtitle
    }).get({
      success: function (res) {
        console.log(res)
        var string = "matchinfo[0]";
        var string2 = res.data[0]
        that.setData({
          [string] : string2
        })
        console.log(that.data.matchinfo)
      }
    })
  },

  bindapply: function(e){
    wx.navigateTo({
      url: '../apply/apply',
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
  }
})