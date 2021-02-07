// miniprogram/pages/manage/manage.js
const app = getApp();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag: false,
    rflag: true,
    language: '中文',
    realname: "",
    permit: "",
    avatarUrl: "",
  },
  onLoad: function (options) {
    if(app.globalData.permit>=3)
    this.setData({
      flag:true,
      rflag:false
    })
    var lan = app.globalData.language;
    this.setData({
      language: lan
    })
    var lastLanuage = this.data.language;
    this.getContent(lastLanuage);
    this.setData({
      realname: app.globalData.realname,
      permit: app.globalData.permit,
      avatarUrl: app.globalData.avatarUrl
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