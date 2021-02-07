// miniprogram/pages/getUserInfo/getUserInfo.js

const app = getApp();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js");
//const { content } = require("../../utils/Chinese.js");
var that=this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    language: "中文",
    nickname:"用户名",
    realname:"真实姓名",
    gender:"男",
    rating:"1.0",
    permit:1,
    phand:"右手",
    bhand:"双手反拍",
    phone:"0",
    grade:"0",
    department:"未指定",
    school:"清华大学",
    avatarurl:"",
    stuid:"0",
    password:"",

    genderarray:['男/Male','女/Female'],
    genderindex:0,
    ratingarray: ['1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0'],
    ratingindex:0,
    phandarray:['右手正拍/Right-Handed','左手正拍/Left-Handed'],
    phandindex:0,
    bhandarray:['双手反拍/Double-Handed','单手反拍/Single-Handed'],
    bhandindex:0
  },

  onLoad: function(e){
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

  getName: function (e){
    this.setData({
      name:e.detail.value
    })
  },
  getRealName: function (e) {
    this.setData({
      realname: e.detail.value
    })
  },
  getGender: function (e) {
    var temp;
    if(e.detail.value==0)temp='男'
    else temp='女'
    this.setData({
      genderindex: e.detail.value,
      gender:temp
    })
  },
  getRating: function (e) {
    var temp=this.data.ratingarray[e.detail.value];
    this.setData({
      ratingindex: e.detail.value,
      rating: temp
    })
  },

  getSchool: function (e) {
    this.setData({
      school: e.detail.value
    })
  },
  getDepartment: function (e) {
    this.setData({
      department: e.detail.value
    })
  },
  getGrade: function (e) {
    this.setData({
      grade: e.detail.value
    })
  },
  getPhone: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  getstuid: function (e) {
    this.setData({
      stuid: e.detail.value
    })
  },
  getpassword: function (e) {
    this.setData({
      password: e.detail.value
    })
  },

  getPhand: function (e) {
    var temp = this.data.phandarray[e.detail.value];
    this.setData({
      phandindex: e.detail.value,
      phand: temp
    })
  },
  getBhand: function (e) {
    var temp = this.data.bhandarray[e.detail.value];
    this.setData({
      bhandindex: e.detail.value,
      bhand: temp
    })
  },

  submit: function (e) {
    const db = wx.cloud.database();
    var that = this;
    this.setData({
      nickname: app.globalData.userInfo.nickName,
      avatarurl:app.globalData.userInfo.avatarUrl
    })
    if (this.data.phone == '0' || this.data.phone == '' || this.data.realname == "真实姓名" || this.data.realname == "" || this.data.school == "" || this.data.school == "未指定" || this.data.department == '' || this.data.department == '未指定')
    {
      wx.showModal({
        title: that.data.content.modalwarning,
        content: that.data.content.completepersonalinfo,
        showCancel:false,
        confirmText: that.data.content.confirmtext
      })
    }
    else
    {
      const that=this;
      db.collection('users').add({
        data: {
          nickname: that.data.nickname,
          realname: that.data.realname,
          stuid: that.data.stuid,
          password: that.data.password,
          gender: that.data.gender,
          rating: that.data.rating,
          permit: 1,
          phand: that.data.phand,
          bhand: that.data.bhand,
          phone: that.data.phone,
          grade: that.data.grade,
          department: that.data.department,
          school: that.data.school,
          avatarurl: that.data.avatarurl
        },
        success: function(res) {
          // 在返回结果中会包含新创建的记录的 _id
          console.log('[users] [新增记录] 成功，记录 _id: ', res._id)
          wx.showModal({
            title: that.data.content.modalhint,
            content: that.data.content.registersuccess,
            showCancel: false,
            confirmText: that.data.content.confirmtext,
            success:function(res){
              wx.reLaunch({
                url: '../index/index'
              })
            }
          })
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '注册失败，请稍后重试'
          })
          console.error('[users] [新增记录] 失败：', err)
        }
      })
    }
  },
})