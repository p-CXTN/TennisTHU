// miniprogram/pages/manage/manage.js
const app = getApp();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: {},
    updateid: "",
    thurs_left:0,
    sat_left:0,
    openforreg:false,
    flag: false,
    rflag: true,
    language: '中文',
    minuscd: 0,
    permit: 0,
    waitlistlength: 0,
    passedlistlength: 0,
  },
  onLoad: async function (options) {
    this.setData({
      permit: app.globalData.permit
    })
    if (app.globalData.permit >= 4)
      this.setData({
        flag: true,
        rflag: false
      })
    var lan = app.globalData.language;
    this.setData({
      language: lan
    })
    var lastLanuage = this.data.language;
    this.getContent(lastLanuage);

    const db = wx.cloud.database();
    var that = this;
    await new Promise((resolve,reject)=>{
      db.collection('globalData').where({
        _id: "XXZMNfdsX1oQeu3u"
      }).get({
        success: function(res){
          var sat = res.data[0].sat_left;
          var thur = res.data[0].thurs_left;
          var ofr = res.data[0].open_for_reg;
          that.setData({
            thurs_left: thur,
            sat_left: sat,
            openforreg: ofr
          })
          resolve();
        }
      })
    }).catch((e) => {})
    await that.refresh();
  },

  refreshpassed:async function(e){
    const db = wx.cloud.database();
    var that = this;

    this.setData({
      dataList: {}
    })

    await new Promise((resolve,reject)=>{
      db.collection(app.globalData.groupName).where({
        valid: false,
        passed: false
      }).get({
        success: function(res){
          that.setData({
            waitlistlength: res.data.length
          })
          for (let i = 0; i < res.data.length; i++) {
            var string = "dataList[" + i + "]";
            var string2 = res.data[i];
            that.setData({
              [string]: string2
            })
          }
          resolve();
        }
      })
    }).catch((e) => {})
    return new Promise((resolve,reject)=>{
      db.collection(app.globalData.groupName).where({
        valid: false,
        passed: true
      }).get({
        success: function(res){
          that.setData({
            passedlistlength: res.data.length
          })
          for (let i = 0; i < res.data.length; i++) {
            var string = "dataList[" + i + "]";
            var string2 = res.data[i];
            that.setData({
              [string]: string2
            })
          }
          resolve();
        }
      })
    }).catch((e) => {})
    
  },

  openreg:async function(e){
    await new Promise((resolve,reject)=>{
      wx.cloud.callFunction({
        name: 'openreg',
        success:function(res){
          resolve();
        }
      })
      this.setData({
        openforreg: true
      })
      wx.showToast({
        title: '报名已开启',
      })
    }).catch((e) => {})
    await this.refresh();
  },

  closereg:async function(e){
    await new Promise((resolve,reject)=>{
      wx.cloud.callFunction({
        name: 'closereg',
        success:function(res){
          resolve();
        }
      })
      this.setData({
        openforreg: false
      })
      wx.showToast({
        title: '报名已关闭',
      })
    }).catch((e) => {})
    await this.refresh();
  },

  onPullDownRefresh: async function (options) {
    var that = this;
    that.refresh();
    wx.stopPullDownRefresh({
      success: (res) => { return; },
    })
  },

  refresh: async function (e) {
    const db = wx.cloud.database();
    var that = this;
    this.setData({
      dataList: {}
    })
    await new Promise((resolve,reject)=>{
      db.collection(app.globalData.groupName).where({
        valid: false,
        passed: false
      }).get({
        success: function(res){
          console.log(res)
          that.setData({
            waitlistlength: res.data.length
          })
          for (let i = 0; i < res.data.length; i++) {
            var string = "dataList[" + i + "]";
            var string2 = res.data[i];
            that.setData({
              [string]: string2
            })
          }
          resolve();
        }
      })
    }).catch((e) => {})
    return new Promise((resolve,reject)=>{
      db.collection(app.globalData.groupName).where({
        valid: false,
        passed: true
      }).get({
        success: function(res){
          console.log(res)
          that.setData({
            passedlistlength: res.data.length
          })
          resolve();
        }
      })
    }).catch((e) => {})
    
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

  bindpass:async function(e){
    const db = wx.cloud.database();
    var that = this;
    await new Promise((resolve,reject)=>{
      db.collection(app.globalData.groupName).doc(e.currentTarget.id).update({
        data:{
          passed:true
        },success:function(res){
          resolve();
        }
      })
    }).catch((e) => {})
    that.refresh();
  },

  minus:async function () {
    const db = wx.cloud.database();
    var that = this;
    var temp4 = that.data.thurslft;
    var temp6 = that.data.satlft;
    if (that.data.minuscd == 4) temp4 = temp4 - 1;
    if (that.data.minuscd == 6) temp6 = temp6 - 1;

    that.setData({
      thurs_left: temp4,
      sat_left: temp6
    })
    await new Promise((resolve,reject)=>{
      wx.cloud.callFunction({
        name: 'minus',
        data: {
          left4: temp4,
          left6: temp6,
        },
        success: res => {
          console.log('更新数据成功')
          resolve();
        }
      })
    }).catch((e) => {})
    
    var tempid = that.data.updateid;

    return new Promise((resolve,reject)=>{
      db.collection(app.globalData.groupName).doc(tempid).update({
        data: {
          valid: true,
          passed: false
        },success:function(res){
          wx.hideLoading({
            success: (res) => {},
          })
          wx.showModal({
            title:"提示",
            content:'申请已通过',
            showCancel:false,
            complete:function(res){
              that.refresh();
              resolve();
            }
          })
        }
      })
    }).catch((e) => {})
    
  },

  bindapprove: async function(e){
    const db = wx.cloud.database();
    var currentUservalid;
    var that = this;
    wx.showLoading({
      title: '处理中',
      mask: true
    })
    await new Promise((resolve,reject)=>{
      db.collection(app.globalData.groupName).where({
        _id: e.currentTarget.id
      }).get({
        success: function (res) {
          console.log(res);
          var temp2 = res.data[0]._id;
          var temp = res.data[0].classdate;
          var tlevel = res.data[0].rating;
          currentUservalid = res.data[0].valid;
          if(tlevel=='D'){
            that.setData({
              updateid: temp2,
              minuscd: 0,
            })
          } else {
            that.setData({
              updateid: temp2,
              minuscd: temp,
            })
          }
          resolve();
        }
      })
    }).catch((e) => {})
    
    await new Promise((resolve,reject)=>{
      db.collection("globalData").doc("XXZMNfdsX1oQeu3u").get({
        success: function(res){
          that.setData({
            satlft: res.data.sat_left,
            thurslft: res.data.thurs_left
          })
          resolve();
        }
      })
    }).catch((e) => {})
    
    if(currentUservalid){
      wx.hideLoading({});
      wx.showModal({
        title: '提示',
        content: '该用户已在其他终端被通过',
        showCancel: false
      })
      that.refresh();
    }
    else {
      await that.minus();
    }
  },

})