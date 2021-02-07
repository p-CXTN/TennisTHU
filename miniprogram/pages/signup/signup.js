// miniprogram/pages/signup/signup.js
const app = getApp();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
var date = require("../../utils/Date.js")

Page({
  data: {
    currentYear:2020,
    currentMonth:1,
    currentDay:1,
    nomatch: false,
    dataList:{},
    language: '中文',
  },

  onLoad: function (options) {
    var lan = app.globalData.language;
    this.setData({
      language: lan
    })
    var lastLanuage = this.data.language;
    this.getContent(lastLanuage);

    this.setData({
      currentYear: date.formatYear(new Date()),
      currentMonth: date.formatMonth(new Date()),
    })

    const db = wx.cloud.database();
    var that = this;
    db.collection('matches').get({
      success:function(res){
        if(res.data.length==0)
        that.setData({
          nomatch: true
        })

        for(let i=0,j=0;i<res.data.length;i++)
        {
          if (res.data[i].year < that.data.currentYear) continue;
          else if (res.data[i].month < that.data.currentMonth && res.data[i].year == that.data.currentYear) continue;
          var string="dataList["+j+"]";
          var string2=res.data[i];
          that.setData({
            [string]: string2
          })
          j++;
        }
      }
    })
  },
  bindmoreinfo: function(e){
    app.globalData.matchtitle = e.currentTarget.id;
    wx.navigateTo({
      url: '../moreinfo/moreinfo',
    })
  },
  
  bindsignup: function(e){
    app.globalData.matchtitle = e.currentTarget.id;
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