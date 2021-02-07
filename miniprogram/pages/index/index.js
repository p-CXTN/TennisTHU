//index.js
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
const app = getApp()

Page({
  data: {

    language: '中文',
    //登录用
    avatarUrl: '../../images/noneuser.png',
    userInfo: {},
    logged: false,
    flag: false,

    //用户信息
    realname:"",
    school:"",
    department:"",
    rating:"",
    gender:"",
    nickname: "",
  },

  //用于首次登录注册时navigate到注册页
  search: async function() {
    return new Promise((resolve,reject)=>{
      if (!this.data.flag)
      {
        this.setData({
          flag:true
        })
        wx.reLaunch({
          url: '../login/login',
        })
      }
      resolve();
    }).catch((e) => {})
    
  },
  //用于免登录
  onGetUserInfo: async function(e) {
    var that = this;
    const db = wx.cloud.database();
    app.globalData.avatarUrl = e.detail.userInfo.avatarUrl;
    app.globalData.nickName = e.detail.userInfo.nickName;
    await new Promise((resolve,reject)=>{
      db.collection('users').where({
        avatarurl: e.detail.userInfo.avatarUrl
      }).get({
        success: function(res) {
          console.log(res)
          if(res.data.length == 0)resolve();
          if (res.data[0].nickname == e.detail.userInfo.nickName)
          {
            console.log('查询用户 成功: ', res)
            app.globalData.logged = true;
            app.globalData.realname = res.data[0].realname;
            that.setData({
              flag: true,
              realname: res.data[0].realname,
              school: res.data[0].school,
              department: res.data[0].department,
              rating: res.data[0].rating,
              nickname: res.data[0].nickname,
              gender: res.data[0].gender + "子球员"
            })
            app.globalData.permit = res.data[0].permit;
            app.globalData.cloudid = res.data[0]._id;
          }
          resolve();
        }
      })
    }).catch((e) => {})

    await new Promise((resolve,reject)=>{
      if (!that.data.logged && e.detail.userInfo) {
        that.setData({
          logged: true,
          avatarUrl: e.detail.userInfo.avatarUrl,
          userInfo: e.detail.userInfo
        });
        app.globalData.userInfo = e.detail.userInfo;
      }
      resolve();
    }).catch((e) => {})

    await this.search();
  },

  onLoad: function(e){
    var lan = app.globalData.language;
    this.setData({
      language: lan
    })
    var lastLanuage = this.data.language;
    this.getContent(lastLanuage);

    const db = wx.cloud.database();
    db.collection("globalData").doc("XXZMNfdsX1oQeu3u").get({
      success:function(res){
        app.globalData.criticalPermission = res.data.criticalPermission;
        app.globalData.groupName = res.data.groupname;
      }
    })
  },

  onShareAppMessage:function(){
    return {
      title: '用TennisTHU查看比赛信息吧！',
      path: 'pages/index/index',
      imageUrl: '/images/share.png'
    }
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
