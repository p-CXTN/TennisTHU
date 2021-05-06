// miniprogram/pages/resetPwd/resetPwd.js
const app = getApp()
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    language: "中文",
    name:"",
    stuid:"",
    phoneno:"",
    newpwd:"",
    forgotpwd: false,
    oldpwd: "",
    userinfo: {},
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
  forgetpwd: function(res){
    this.setData({
      forgotpwd: true
    })
    console.log(this.data.forgotpwd)
  },
  syncname: function(e){
    var that = this;
    if(e.detail.value != "")
    that.setData({
      name: e.detail.value
    })
  },
  syncstuid: function(e){
    var that = this;
    if(e.detail.value != "")
    that.setData({
      stuid: e.detail.value
    })
  },
  syncphone: function(e){
    var that = this;
    if(e.detail.value != "")
    that.setData({
      phoneno: e.detail.value
    })
  },
  syncoldpwd: function(e){
    var that = this;
    if(e.detail.value != "")
    that.setData({
      oldpwd: e.detail.value
    })
  },
  syncpwd: function(e){
    var that = this;
    if(e.detail.value != "")
    that.setData({
      newpwd: e.detail.value
    })
  },
  submit: async function(){
    console.log(this.data)
    wx.showLoading({});
    const db = wx.cloud.database();
    var that = this;
    console.log(that.data.name,that.data.stuid,that.data.phoneno,that.data.newpwd,app.globalData.nickName,app.globalData.avatarUrl)
    var proceed = false;
    await new Promise((resolve,reject)=>{
      if(that.data.forgotpwd){
        db.collection('users').where({
          realname: that.data.name,
          stuid: that.data.stuid,
          phone: that.data.phoneno
        }).get({
          success:function(res){
            if(res.data.length == 0){
              wx.hideLoading({});
              wx.showModal({
                title: that.data.content.modalwarning,
                content: that.data.content.usernotfound,
                showCancel:false,
                success: function(res){
                  resolve();
                }
              })
            } else {
              proceed = true;
              that.setData({
                userinfo: res.data[0]
              })
              resolve();
            }
          }
        })
      } else {
        if(app.globalData.logged == false){
          wx.hideLoading({})
          wx.showModal({
            title: that.data.content.modalwarning,
            content: that.data.content.reqlogin,
            showCancel: false,
            success: function(res){
              resolve();
            }
          })
        } else {
          db.collection('users').where({
            nickname: app.globalData.nickName,
            avatarurl: app.globalData.avatarUrl,
            password: that.data.oldpwd
          }).get({
            success: function(res){
              if(res.data.length == 0){
                wx.hideLoading({});
                wx.showModal({
                  title: that.data.content.modalwarning,
                  content: that.data.content.pwderror,
                  showCancel:false,
                  success: function(res){
                    resolve();
                  }
                })
              } else {
                proceed = true;
                that.setData({
                  userinfo: res.data[0]
                })
                resolve();
              }
            }
          })
        }
      }
    }).catch((e) => {})
    console.log(proceed)
    if(proceed == false)return;
    await new Promise((resolve,reject)=>{
      db.collection('users').doc(that.data.userinfo._id).update({
        data:{
          password: that.data.newpwd
        },
        success: function(res){
          wx.hideLoading({});
          wx.showModal({
            title: that.data.content.modalhint,
            content: that.data.content.resetpwdsuccess,
            showCancel: false,
            complete (res){
              resolve();
            }
          })
        }
      })
    }).catch((e) => {})
    wx.reLaunch({
      url: '../index/index',
    })
  }
})