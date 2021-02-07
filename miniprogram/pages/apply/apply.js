// miniprogram/pages/apply/apply.js
const app = getApp();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    language: "中文",
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
  }
})