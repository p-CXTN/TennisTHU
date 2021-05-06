// miniprogram/pages/ymatch/ymatch.js
const app = getApp();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
var utiltime = require("../../utils/Date.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    language: '中文',
    avatarUrl: '../../images/noneuser.png',
    realname:"",
    currentTab: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    const db = wx.cloud.database();
    var that = this;
    var lan = app.globalData.language;
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
    that.setData({
      avatarUrl: app.globalData.avatarUrl,
      realname: app.globalData.realname
    })
  },

  
  switchTab: function (e){
    let tab = e.currentTarget.id
    if (tab === 'tab2') {
      this.setData({ currentTab: 2 })//search
    } else if (tab === 'tab-1') {
      this.setData({ currentTab: -1 })
    }  else if (tab === 'tab1') {
      this.setData({ currentTab: 1 })
    } else if (tab === 'tab3') {
      this.setData({ currentTab: 3 })
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