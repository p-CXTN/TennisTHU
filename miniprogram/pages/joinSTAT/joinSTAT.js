// miniprogram/pages/joinSTAT/joinSTAT.js
const app = getApp();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {

    email: "",
    realname: "真实姓名",
    gender: "男",
    phone: "0",
    grade: "0",
    department: "未指定",
    stuid: "0",
    wechatid: "",
    classdate: 4,
    rating: 'A',
    officer: false,

    thursfull: false,
    satfull: false,

    classarray: ['周四/Thursdays 16:00-18:00', '周六/Saturdays 10:00-12:00'],
    classindex: 0,
    ratingarray: ['A', 'B', 'C', 'D'],
    ratingindex: 0, 
    officerarray: ['我有意愿成为干事', '否'],
    officerindex: 1,

    flag: null,
    rflag: null ,
    flag2: false,
    rflag2: true,
    lanflag: false,
    language: "中文"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("Current group is",app.globalData.groupName);
    var lan = app.globalData.language;
    this.setData({
      language: lan
    })
    if(lan == "中文")this.setData({
      lanflag: true
    })
    var lastLanuage = this.data.language;
    this.getContent(lastLanuage);

    const db = wx.cloud.database();
    var that = this;
    var nickn = app.globalData.nickName;
    var avturl = app.globalData.avatarUrl;
    var groupName = app.globalData.groupName;

    db.collection(app.globalData.groupName).where({
      nickname: nickn,
      avatarurl: avturl
    }).get({
      success: function(res){
        if(res.data[0].gender=="男"||res.data[0].gender=="女")
        {
          that.setData({
            flag2: true,
            rflag2:false
          })
        }
      }
    })

    db.collection("users").where({
      nickname: nickn,
      avatarurl: avturl
    }).get({
      success: function(res){
        that.setData({
          realname: res.data[0].realname,
          gender: res.data[0].gender,
          phone: res.data[0].phone,
          grade: res.data[0].grade,
          department: res.data[0].department,
          stuid: res.data[0].stuid,
        })
      }
    })

    db.collection("globalData").doc("XXZMNfdsX1oQeu3u").get({
      success: function(res){
        if(res.data.open_for_reg==true)
        {
          that.setData({
            flag:true,
            rflag:false
          })
        }
        else
        {
          that.setData({
            flag: false,
            rflag: true
          })
        }
        if(res.data.thurs_left<=2)
        {
          that.setData({
            thursfull: true
          })
        }
        if (res.data.sat_left <= 2) {
          that.setData({
            satfull: true
          })
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

  getemail: function(e){
    this.setData({
      email: e.detail.value
    })
  },
  getwechatid: function (e) {
    this.setData({
      wechatid: e.detail.value
    })
  },
  getclassdate: function (e) {
    var temp;
    if (e.detail.value == 0) temp = 4;
    else temp = 6;
    this.setData({
      classindex: e.detail.value,
      classdate: temp
    })
  },

  getRating: function (e) {
    var temp = this.data.ratingarray[e.detail.value];
    this.setData({
      ratingindex: e.detail.value,
      rating: temp
    })
  },
  getofficer: function (e) {
    var temp;
    if (e.detail.value == 0) temp = true;
    else temp = false;
    this.setData({
      officerindex: e.detail.value,
      officer: temp
    })
  },

  submit: function(e){
    var that = this;
    if(this.data.wechatid == "" || this.data.email == "")
    {
      wx.showModal({
        title: that.data.content.modalwarning,
        content: that.data.content.completepersonalinfo,
        showCancel: false,
        confirmText: that.data.content.confirmtext,
      })
    }
    else
    {

      const db = wx.cloud.database();
      var that = this;
      var nickn = app.globalData.nickName;
      var avturl = app.globalData.avatarUrl;

      var warningtext = that.data.content.submitwarning1;
      warningtext += that.data.classdate==4?that.data.content.submitwarningthurs:that.data.content.submitwarningsat;
      warningtext += that.data.content.submitwarning2;

      console.log(warningtext,that.data.content)
      wx.showModal({
        title: that.data.content.modalwarning,
        content: warningtext,
        showCancel: true,
        cancelText: that.data.content.modalno,
        confirmText: that.data.content.modalyes,
        success:function(res){
          if(res.cancel){return;}
          else{
            db.collection(app.globalData.groupName).add({
              data: {
                nickname: nickn,
                realname: that.data.realname,
                stuid: that.data.stuid,
                gender: that.data.gender,
                rating: that.data.rating,
                phone: that.data.phone,
                grade: that.data.grade,
                department: that.data.department,
                avatarurl: avturl,
                email: that.data.email,
                classdate: that.data.classdate,
                wechat: that.data.wechatid,
                officer: that.data.officer,
                actionpoints: 8,
                passed: false,
                valid: false
              },
              success: res => {
                wx.showModal({
                  title: that.data.content.modalhint,
                  content: that.data.content.modalsubmitsuccess,
                  showCancel:false,
                  confirmText: that.data.content.confirmtext,
                  success: function(res){
                    that.setData({
                      flag2: true,
                      rflag2: false
                    })
                  }
                })
                console.log('[新增记录] 成功，记录 _id: ', res._id)
              }
            })
          }
        }
      })
      
    }
  }
})