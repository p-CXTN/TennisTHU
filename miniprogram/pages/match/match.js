// miniprogram/pages/match/match.js
const app = getApp();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
var date = require("../../utils/Date.js")

Page({
  data: {
    monthdays : [31,29,31,30,31,30,31,31,30,31,30,31],
    absdays: 0,
    currentTab: 2,
    currentYear: 2020,
    currentMonth: 1,
    currentDay: 1,
    nomatch: false,
    dataList: {},
    language: '中文',
    permission: 0,
    permitgranted: false,
  },

  onPullDownRefresh:function(){
    
  },

  onLoad: function (options) {
    this.setData({
      currentDay: date.formatDay(new Date()),
      currentYear: date.formatYear(new Date()),
      currentMonth: date.formatMonth(new Date()),
    })
    var permitgranted;
    if(app.globalData.criticalPermission<=app.globalData.permit)permitgranted = true;
    else permitgranted = false;
    this.setData({
      permitgranted: permitgranted
    })
    if(app.globalData.permit>=6)permitgranted = true;
    else permitgranted = false;
    app.globalData.vpermitgranted = permitgranted;
    var days=0;
    for(let i=1;i<this.data.currentMonth;i++)days+=this.data.monthdays[i];
    days+=this.data.currentDay;
    this.setData({
      absdays: days
    })

    var lan = app.globalData.language;
    this.setData({
      language: lan
    })
    var lastLanuage = this.data.language;
    this.getContent(lastLanuage);
    
    const db = wx.cloud.database();
    var that = this;
    db.collection('match').get({
      success: function (res) {
        if (res.data.length == 0)
          that.setData({
            nomatch: true
          })

        for (let i = 0, j = 0; i < res.data.length; i++) {
          if (res.data[i].year < that.data.currentYear) continue;
          else if (res.data[i].month < that.data.currentMonth && res.data[i].year == that.data.currentYear) continue;
          var string = "dataList[" + j + "]";
          var string2 = res.data[i];
          that.setData({
            [string]: string2
          })
          j++;
        }
      }
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
  }
})