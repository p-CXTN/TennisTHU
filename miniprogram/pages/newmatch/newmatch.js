// miniprogram/pages/newmatch/newmatch.js
const app = getApp();
const db = wx.cloud.database();
Page({

  data: {
    title:"请输入比赛名称",
    year:'年',
    month:'月',
    date:'日',
    location: '请输入比赛地点',
    gp: false,
    intro: '短介绍用于比赛概览页面，尽量控制在三行以内',
    info:'比赛详情为详情页显示的介绍文字',
    ms:'男单签位',
    ws:'女单签位',
    md:'男双签位',
    wd:'女双签位',
    doubles:'双打(性别不限)签位',
    rr_s: '单打小组赛每组签位数(0表示无小组赛)',
    rr_d: '双打小组赛每组签位数(0表示无小组赛)',
    rr_s_fwd: '单打小组赛出线签位数(0表示无小组赛)',
    rr_d_fwd: '单打小组赛出线签位数(0表示无小组赛)',

    newmatch:true,

  },

  getTitle:function(e){
    this.setData({
      title:e.detail.value
    })
  },

  getGroupMatch:function(e){
    if(e.detail.value=="是")
    this.setData({
      gp:true
    })
  },

  lookup: function (e) {
    var ttitle = this.data.title;
    var that = this;
    db.collection('matches').where({
      title: db.command.eq(ttitle)
    }).get({
      success: function (res) {
        console.log(res);
        var string1 = res.data[0].title;
        var string2 = res.data[0].year;
        var string3 = res.data[0].month;
        var string4 = res.data[0].date;
        var string5 = res.data[0].location;
        var string6 = res.data[0].intro;
        var string7 = res.data[0].info;
        var string8 = res.data[0].draw_m;
        var string9 = res.data[0].draw_f;
        var string10 = res.data[0].draw_md;
        var string11 = res.data[0].draw_fd;
        var string12 = res.data[0].draw_d;
        var string13 = res.data[0].rr_s;
        var string14 = res.data[0].rr_d;
        var string15 = res.data[0].fr_s;
        var string16 = res.data[0].fr_d;
        var string17 = res.data[0]._id;

        that.setData({
          newmatch: false,
          match_id: string17,
          title: string1,
          year: string2,
          month: string3,
          date: string4,
          location: string5,
          intro: string6,
          info: string7,
          ms: string8,
          ws: string9,
          md: string10,
          wd: string11,
          doubles: string12,
          rr_s: string13,
          rr_d: string14,
          rr_s_fwd: string15,
          rr_d_fwd: string16,
        })
      }
    })
  },

  getYear:function(e){
    this.setData({
      year:e.detail.value
    })
  },
  getMonth: function (e) {
    this.setData({
      month: e.detail.value
    })
  },
  getDate: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  getLoc: function (e) {
    this.setData({
      location: e.detail.value
    })
  },
  getIntro: function (e) {
    this.setData({
      intro: e.detail.value
    })
  },
  getInfo: function (e) {
    this.setData({
      info: e.detail.value
    })
  },

  getms: function (e) {
    this.setData({
      ms: e.detail.value
    })
  },
  getws: function (e) {
    this.setData({
      ws: e.detail.value
    })
  },
  getmd: function (e) {
    this.setData({
      md: e.detail.value
    })
  },
  getwd: function (e) {
    this.setData({
      wd: e.detail.value
    })
  },
  getd: function (e) {
    this.setData({
      doubles: e.detail.value
    })
  },
  getrrs: function (e) {
    this.setData({
      rr_s: e.detail.value
    })
  },
  getrrd: function (e) {
    this.setData({
      rr_d: e.detail.value
    })
  },
  getfrrs: function (e) {
    this.setData({
      rr_s_fwd: e.detail.value
    })
  },
  getfrrd: function (e) {
    this.setData({
      rr_d_fwd: e.detail.value
    })
  },

  submit:function(e){
    if(this.data.newmatch==true)
    {
      var that = this;
      db.collection('matches').add({
        data:{
          openforreg:true,
          title: that.data.title,
          year: that.data.year,
          month: that.data.month,
          date: that.data.date,
          gp: that.data.gp,
          location: that.data.location,
          intro: that.data.intro,
          info: that.data.info,
          draw_m: that.data.ms,
          draw_f: that.data.ws,
          draw_md: that.data.md,
          draw_fd: that.data.wd,
          draw_d: that.data.doubles,
          rr_s: that.data.rr_s,
          rr_d: that.data.rr_d,
          fr_s: that.data.rr_s_fwd,
          fr_d: that.data.rr_d_fwd
        }
      })
      wx.showModal({
        title: '提示',
        content: '比赛信息创建成功',
        showCancel: false,
        success: function (ee) {
          if (ee.confirm) {
            wx.navigateBack({
              url: '../manage/manage'
            })
          }
        }
      })
    }
    else
    {
      var that = this;
      var matchid = this.data.match_id;
      db.collection('matches').doc(matchid).update({
        data: {
          openforreg: true,
          gp: that.data.gp,
          title: that.data.title,
          year: that.data.year,
          month: that.data.month,
          date: that.data.date,
          location: that.data.location,
          intro: that.data.intro,
          info: that.data.info,
          draw_m: that.data.ms,
          draw_f: that.data.ws,
          draw_md: that.data.md,
          draw_fd: that.data.wd,
          draw_d: that.data.doubles,
          rr_s: that.data.rr_s,
          rr_d: that.data.rr_d,
          fr_s: that.data.rr_s_fwd,
          fr_d: that.data.rr_d_fwd
        }
      })
      wx.showModal({
        title: '提示',
        content: '比赛信息更新成功',
        showCancel: false,
        success: function(ee){
          if(ee.confirm)
          {
            wx.navigateBack({
              url: '../manage/manage'
            })
          }
        }
      })
    }
  },

  onLoad: function (options) {
    var nm = app.globalData.nickName;
    console.log(nm);
    db.collection('users').where({
      nickname: nm
    }).get({
      success: function(res){
        console.log(res)
        if(res.data[0].permit<4)
        {
          wx.showModal({
            title: '提示',
            content: '您没有创建比赛的权限',
            showCancel: false,
            success:function(e){
              if(e.confirm)
              {
                wx.navigateBack({
                  url:'../manage/manage'
                })
              }
            }
          })
        }
      }
    })
  },

})