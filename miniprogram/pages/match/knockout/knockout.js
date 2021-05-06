// pages/match/knockout/knockout.js
const app = getApp();
var chinese = require("../../../utils/Chinese.js")
var english = require("../../../utils/English.js")
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    language: "",
    ablevel: ["甲组", "乙组"],
    ablevelindex: 0,
    rounds: ["------"],
    roundsindex: 0,
    rounddelta: 0,
    datalist: {},
    reslist: {},
    permitgranted: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindroundschange: function (e) {
      var temp = parseInt(e.detail.value);
      var that = this;
      that.setData({
        roundsindex: temp
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

    setrounds: function () {
      var that = this;
      var temp = ["------"];
      switch (that.data.rounddelta) {
        case 0: break;
        case 1: temp = ["Finals (2→1)", "Playoff"]; break;
        case 2: temp = ["Semi-Finals (4→2)", "Finals (2→1)", "Playoff"]; break;
        case 3: temp = ["Quarter-Finals (8→4)", "Semi-Finals (4→2)", "Finals (2→1)", "Playoff"]; break;
        case 4: temp = ["Round of 16 (16→8)", "Quarter-Finals (8→4)", "Semi-Finals (4→2)", "Finals (2→1)", "Playoff"]; break;
        case 5: temp = ["Round of 32 (32→16)", "Round of 16 (16→8)", "Quarter-Finals (8→4)", "Semi-Finals (4→2)", "Finals (2→1)", "Playoff"]; break;
        case 6: temp = ["Round of 64 (64→32)", "Round of 32 (32→16)", "Round of 16 (16→8)", "Quarter-Finals (8→4)", "Semi-Finals (4→2)", "Finals (2→1)", "Playoff"]; break;
        case 7: temp = ["Round of 128 (128→64)", "Round of 64 (64→32)", "Round of 32 (32→16)", "Round of 16 (16→8)", "Quarter-Finals (8→4)", "Semi-Finals (4→2)", "Finals (2→1)", "Playoff"]; break;
        default: break;
      }
      that.setData({
        rounds: temp
      })
    },

    toleft: function () {
      var that = this;
      var temp = that.data.roundsindex;
      if (temp == 0) return;
      that.setData({
        roundsindex: temp - 1
      })
    },
    toright: function () {
      var that = this;
      var temp = that.data.roundsindex;
      if (temp == that.data.rounddelta) return;
      that.setData({
        roundsindex: temp + 1
      })
    },

    refreshwinner: async function () {
      wx.showLoading({
        title: 'Loading',
      })
      var that = this;
      const db = wx.cloud.database();
      var nummin, nummax;
      switch (that.data.rounds[that.data.roundsindex]) {
        case "Round of 128 (128→64)": nummax = 255, nummin = 128; break;
        case "Round of 64 (64→32)": nummax = 127, nummin = 64; break;
        case "Round of 32 (32→16)": nummax = 63, nummin = 32; break;
        case "Round of 16 (16→8)": nummax = 31, nummin = 16; break;
        case "Quarter-Finals (8→4)": nummax = 15, nummin = 8; break;
        case "Semi-Finals (4→2)": nummax = 7, nummin = 4; break;
        case "Finals (2→1)": nummax = 3, nummin = 2; break;
        case "Playoff": nummax = 1, nummin = 1; break;
      }
      for (var i = nummin; i <= nummax; i++) {//2x and 2x+1
        var winner = "0";
        await Promise.all([new Promise((resolve, reject) => {
          db.collection('knockout').where({
            number: db.command.eq(2*i)
          }).get({
            success: function(res){
              if(res.data[0].matchw >= 3)winner = res.data[0].name;
              resolve();
            }
          })
        }).catch((e) => { }),
        new Promise((resolve, reject) => {
          db.collection('knockout').where({
            number: db.command.eq(2*i + 1)
          }).get({
            success: function(res){
              if(res.data[0].matchw >= 3)winner = res.data[0].name;
              resolve();
            }
          })
        }).catch((e) => { })  ])
        if(winner !== "0"){
          console.log(i,winner)
          var iwinner = {};
          await new Promise((resolve, reject) => {
            db.collection('knockout').where({
              number: i
            }).get({
              success: function(res){
                iwinner = res.data[0];
                resolve();
              }
            })
          }).catch((e) => { })
          db.collection("knockout").doc(iwinner._id).update({
            data:{
              name: winner
            }
          })
        } 
      }
      wx.hideLoading({});
      wx.showModal({
        title: "提示",
        content: "当前轮次淘汰赛对决结果已更新",
        showCancel: false,
        success: function(res){
          return;
        }
      })
    }
  },

  attached: async function () {
    wx.showLoading({
      title: 'Loading',
    })
    const db = wx.cloud.database();
    var that = this;

    var lan = app.globalData.language;
    that.setData({
      language: lan
    })
    var lastLanuage = that.data.language;
    that.getContent(lastLanuage);

    await new Promise((resolve, reject) => {
      db.collection("knockout").where({
        number: db.command.lte(20)
      }).get({
        success: function (res) {
          that.setData({
            datalist: res.data
          })
          resolve();
        }
      })
    }).catch((e) => { })

    await new Promise((resolve, reject) => {
      db.collection("knockout").where({
        number: db.command.gt(20)
      }).get({
        success: function (res) {
          var datalisttemp = [];
          datalisttemp = that.data.datalist;
          for (var i = 0; i < res.data.length; i++)datalisttemp.push(res.data[i]);
          that.setData({
            datalist: datalisttemp
          })
          resolve();
        }
      })
    }).catch((e) => { })
    console.log(that.data.datalist)

    var permitg = false;
    if (app.globalData.permit >= 6) permitg = true;
    await new Promise((resolve, reject) => {
      db.collection('globalData').doc('XXZMNfdsX1oQeu3u').get({
        success: function (res) {
          that.setData({
            permitgranted: permitg,
            rounddelta: res.data.rounds,
            roundsindex: res.data.rounddefault
          })
          that.setrounds();
          resolve();
        }
      })
    }).catch((e) => { })
    //console.log(that.data.datalist)
    that.data.datalist.sort((a, b) => b.number - a.number)

    //console.log(that.data.datalist)
    await new Promise((resolve, reject) => {
      var datalist = that.data.datalist;
      console.log(that.data.rounddelta)
      for (var i = 0; i <= that.data.rounddelta + 1; i++) {
        for (var j = 0; j < (datalist.length + 1) / 2; j++) {
          //console.log(i,j)
          var string = "reslist[" + i + "][" + j + "]";
          that.setData({
            [string]: datalist[j]
          })
        }

        //console.log(that.data.reslist)
        datalist.splice(0, (datalist.length + 1) / 2);
      }
      resolve();
    }).catch((e) => { })
    wx.hideLoading({});
  }
})
