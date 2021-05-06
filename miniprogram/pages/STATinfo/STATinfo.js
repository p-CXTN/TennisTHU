// miniprogram/pages/enterscore/enterscore.js
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
  changeLanguage: function (e) {
    var version = this.data.language;
    if (version == "中文") {
      app.globalData.language="英文";
      if (this.data.gender == "男子球员")
      {
        this.setData({
          language: "英文",
          gender: "Man Player"
        })
      }
      else if (this.data.gender == "女子球员")
      {
        this.setData({
          language: "英文",
          gender: "Woman Player"
        })
      }
      else
      this.setData({
        language: "英文"
      })
    } else {
      app.globalData.language = "中文";
      if(this.data.gender=="Man Player")
      {
        this.setData({
          language: "中文",
          gender: "男子球员"
        })
      }
      else
      {
        this.setData({
          language: "中文",
          gender: "女子球员"
        })
      }
    }
    var lastLanuage = this.data.language;
    this.getContent(lastLanuage);
  },

  onShareAppMessage:function(){
    return {
      title: '用TennisTHU查看招新信息吧！',
      path: 'pages/STATinfo/STATinfo',
      imageUrl: '/images/share.png'
    }
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
  bindapply: function(e){
    var that = this;
    if(app.globalData.logged==true)
    {
      wx.navigateTo({
        url: '../joinSTAT/joinSTAT',
      })
    }
    else
    {
      wx.showModal({
        title: that.data.content.modalwarning,
        content: that.data.content.reqlogin,
        showCancel:false,
        confirmText: that.data.content.confirmtext,
        success:function(res){
          wx.reLaunch({
            url: '../index/index',
          })
        }
      })
    }
  }
})