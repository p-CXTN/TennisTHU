// miniprogram/pages/getUserInfo/getUserInfo.js

const app = getApp();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
var that = this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logged: false,
    pfid: "",
    language: "中文",
    realname: "真实姓名",
    gender: "男",
    rating: "1.0",
    phand: "右手",
    bhand: "双手反拍",
    phone: "0",
    grade: "0",
    department: "未指定",
    school: "未指定",
    stuid: "0",

    genderarray: ['男/Male', '女/Female'],
    genderindex: 0,
    ratingarray: ['1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0'],
    ratingindex: 0,
    phandarray: ['右手正拍/Right-Handed', '左手正拍/Left-Handed'],
    phandindex: 0,
    bhandarray: ['双手反拍/Double-Handed', '单手反拍/Single-Handed'],
    bhandindex: 0
  },

  onLoad: function (e) {
    var lan = app.globalData.language;
    var that = this;
    this.setData({
      language: lan
    })
    var lastLanuage = this.data.language;
    this.getContent(lastLanuage);

    if(app.globalData.logged==true)
    {
      this.setData({
        logged: true
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

    const db = wx.cloud.database();
    var that = this;

    var tempnn = app.globalData.avatarUrl;
    db.collection("users").where({
      avatarurl: tempnn
    }).get({
      success:function(res){
        console.log(res);
        var iiid = res.data[0]._id;
        var string1 = res.data[0].realname;
        var string2 = res.data[0].stuid;
        var string3 = res.data[0].gender;
        var string4 = res.data[0].rating;
        var string5 = res.data[0].school;
        var string6 = res.data[0].department;
        var string7 = res.data[0].grade;
        var string8 = res.data[0].phone;
        var string9 = res.data[0].phand;
        var string10 = res.data[0].bhand;

        var var3,var4,var9, var10;
        if(string3=="男")var3=0;
        else var3=1;

        if(string9=="右手")var9=0;
        else var9=1;

        if(string10=="双手反拍")var10=0;
        else var10=1;

        switch(string4)
        {
          case "1.0": var4 = 0; break;
          case "1.5": var4 = 1; break;
          case "2.0": var4 = 2; break;
          case "2.5": var4 = 3; break;
          case "3.0": var4 = 4; break;
          case "3.5": var4 = 5; break;
          case "4.0": var4 = 6; break;
          case "4.5": var4 = 7; break;
          case "5.0": var4 = 8; break;
          case "5.5": var4 = 9; break;
          case "6.0": var4 = 10; break;
          case "6.5": var4 = 11; break;
          case "7.0": var4 = 12; break;
        }

        that.setData({
          pfid: iiid,
          realname: string1,
          stuid: string2,
          gender: string3,
          rating: string4,
          school: string5,
          department: string6,
          grade: string7,
          phone: string8,
          phand: string9,
          bhand: string10,

          genderindex: var3,
          ratingindex: var4,
          phandindex: var9,
          bhandindex: var10
        })
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

  getName: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  getRealName: function (e) {
    this.setData({
      realname: e.detail.value
    })
  },
  getGender: function (e) {
    var temp;
    if (e.detail.value == 0) temp = '男'
    else temp = '女'
    this.setData({
      genderindex: e.detail.value,
      gender: temp
    })
  },
  getRating: function (e) {
    var temp = this.data.ratingarray[e.detail.value];
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
    if (this.data.phone == '0' || this.data.phone == '' || this.data.realname == "真实姓名" || this.data.realname == "" || this.data.school == "" || this.data.school == "未指定" || this.data.department == '' || this.data.department == '未指定') {
      wx.showModal({
        title: '提示',
        content: '请完善个人信息！'
      })
    }
    else {
      /*const that = this;
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
        success: res => {
          // 在返回结果中会包含新创建的记录的 _id
          wx.showToast({
            title: '修改成功',
          })
          wx.navigateBack({})
          console.log('[users] [更新] 成功，记录 _id: ', res._id)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '更新失败，请稍后重试'
          })
        }
      })*/
      var that = this;
      console.log(that.data.pfid)
      wx.cloud.callFunction({
        name: "modifyuser",
        data: {
          _id: that.data.pfid,
          gender: that.data.gender,
          rating: that.data.rating,
          school: that.data.school,
          department: that.data.department,
          grade: that.data.grade,
          phone: that.data.phone,
          phand: that.data.phand,
          bhand: that.data.bhand
        },
        success: res => {
          wx.showToast({
            title: '修改成功',
          })
          wx.navigateBack({})
          console.log('[users] [更新] 成功，记录 _id: ', res._id)
        }
      })
    }
  },
})