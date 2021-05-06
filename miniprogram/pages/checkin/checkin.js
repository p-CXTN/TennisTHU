// miniprogram/pages/checkin/checkin.js
const app = getApp()
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
var utiltime = require("../../utils/Date.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    permit: 0,
    flag: false,
    rflag: true,
    language: "中文",
    month: 0,
    day: 0,
    subjectarray:["教练/活动管理干事"],
    subjectindex:0,
    datalist: [],
    actdata: {},
    stacklevel: 0,
    continuecheckin: false,
    chkinnottoday: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    var that = this;
    const db = wx.cloud.database();

    var month = utiltime.formatMonth(new Date());
    var day = utiltime.formatDay(new Date());
    
/*
    var dtlt={scaneename:"陈西川",classdate:4,rating:'D',activitynum:3,scantime:"2021/02/10-12:12:12"};
    var tdt = {};
    tdt = that.data.datalist;
    tdt.push(dtlt);
    that.setData({
      datalist: tdt
    })*/
    var currentActivity = -1;
    await new Promise((resolve,reject)=>{
      db.collection("activities").where({
        month: toString(month),
        day: toString(day)
      }).get({
        success:function(res){
          if(res.data.length==0)resolve();
          else currentActivity = res.data[0].number;
          resolve();
        }
      })
    })
    
    console.log(app.globalData.openid)
    await new Promise((resolve,reject)=>{
      db.collection("checkindata").where({
        _openid: app.globalData.openid,
        activitynum: currentActivity
      }).get({
        success: function(res){
          if(res.data.length == 0)resolve();
          else {
            that.setData({
              datalist: res.data
            })
            resolve();
          }
        }
      })
    })

    

    db.collection('globalData').doc('XXZMNfdsX1oQeu3u').get({
      success: function(res){
        console.log(res)
        that.setData({
          chkinnottoday: res.data.chkinnottoday
        })
      }
    })

    var lan = app.globalData.language;
    this.setData({
      language: lan,
      month: month,
      day: day,
    })
    var lastLanuage = this.data.language;
    this.getContent(lastLanuage);

    this.setData({
      permit: app.globalData.permit
    })
    if (app.globalData.permit >= 3)
      this.setData({
        flag: true,
        rflag: false
      })
    db.collection('activities').get({
      success:function(res){
        res.data.sort((a,b) => a.num - b.num);
        that.setData({
          actdata: res.data
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
  
  getsubject:function(e){
    var temp = this.data.subjectarray[e.detail.value];
    this.setData({
      subjectindex:e.detail.value,
      subject: temp
    })
  },
  checkboxchange: function(e){
    var that = this;
    var temp = !that.data.continuecheckin;
    that.setData({
      continuecheckin: temp
    })
  },

  continuescan: function(){
    var that = this;
    if(that.data.stacklevel>=12){
      that.data.stacklevel = 0;
      return;
    }
    that.data.stacklevel ++;
    that.scanQR();
  },

  scanQR: async function(e){
    var that = this;
    const db = wx.cloud.database();
    wx.scanCode({
      success: async function(res){
        wx.showLoading({
          title: '处理中',
        })
        var string = res.result;
        await new Promise((resolve,reject)=>{
          if(string.substring(7,9)!=="OK"){
            wx.hideLoading({});
            wx.showModal({
              title: that.data.content.modalwarning,
              content: "二维码状态标志异常，请让被扫码人重新生成二维码！",
              showCancel: false,
              success: function(res){
                if(res.confirm && that.data.continuecheckin)that.continuescan();
                return;
              }
            })
          }
          resolve();
        }).catch((e) => {})
        
    
        var scaneeopenid = string.substring(21,49);
        var signintype = string.substring(61,75);
        var activitynum = parseInt(string.substring(88,90));
        var codetime = string.substring(102,121);
        var scantime = utiltime.formatTime(new Date());

        if( (!that.data.chkinnottoday) && (that.data.actdata[parseInt(activitynum)-1].month!=that.data.month || that.data.actdata[parseInt(activitynum)-1].day != that.data.day)){
          wx.hideLoading({});
          await new Promise((resolve,reject)=>{
            wx.showModal({
              title: that.data.content.modalwarning,
              content: "签到失败！用户的签到二维码不是当日活动！",
              showCancel: false,
              success: function(res){
                console.log(that.data.continuecheckin)
                if(that.data.continuecheckin)that.continuescan();
                return;
              }
            })
          }).catch((e) => {})
          
        }
    
        db.collection(app.globalData.groupName).where({
          _openid: scaneeopenid
        }).get({
          success: async function(res){
            if(res.data.length == 0){
              wx.hideLoading({});
              wx.showModal({
                title: that.data.content.modalwarning,
                content: "签到失败！没有找到该用户",
                showCancel: false,
                success: function(res){
                  if(that.data.continuecheckin)that.continuescan();
                  return;
                }
              })
            } else if (res.data[0].z_chkin[parseInt(activitynum)]){
              wx.hideLoading({});
              wx.showModal({
                title: that.data.content.modalwarning,
                content: "签到失败！该用户已经签到",
                showCancel: false,
                success: function(res){
                  if(that.data.continuecheckin)that.continuescan();
                  return;
                }
              })
            } else {
              var userid = res.data[0]._id;
              var z_chkin = res.data[0].z_chkin;
              z_chkin[parseInt(activitynum)] = true;

              db.collection(app.globalData.groupName).doc(userid).update({
                data:{
                  scanned: true
                }
              })
              
              var datalistitem = {
                scaneename: res.data[0].realname,
                classdate: res.data[0].classdate,
                rating: res.data[0].rating,
                scaneeopenid: scaneeopenid,
                signintype: signintype,
                activitynum: activitynum,
                codetime: codetime,
                scantime: scantime
              }
              var datalisttemp = {};
              datalisttemp = that.data.datalist;
              datalisttemp.push(datalistitem);
              await new Promise((resolve,reject)=>{
                db.collection('checkindata').add({
                  data:{
                    scaneeopenid: scaneeopenid,
                    signintype: signintype,
                    activitynum: activitynum,
                    codetime: codetime,
                    scantime: scantime,
                    scaneename: datalistitem.scaneename,
                    classdate: datalistitem.classdate,
                    rating: datalistitem.rating,
                  },
                  //scaner openid is the openid of the specific doc (the creater of each entry)
                  success: function(res){
                    resolve();
                  }
                })
              }).catch((e) => {})
              console.log(userid)
              await new Promise((resolve,reject)=>{
                db.collection(app.globalData.groupName).doc(userid).update({
                  data:{
                    z_chkin: z_chkin
                  },
                  success: function(res){
                    wx.hideLoading({});
                    wx.showToast({
                      title: '签到成功',
                    })
                    resolve();
                  }
                })
              }).catch((e) => {})
              that.setData({
                datalist: datalisttemp
              })
              console.log(that.data.continuecheckin)
              if(that.data.continuecheckin)that.continuescan();
            }
          }
        })
      }
    })

    //if(that.data.continuecheckin)that.scanQR();
    //var string = "Status=OK;UserOpenID=oIgoa40YE647UWFAYY8xCnIgXzdw;SignInType=NormalActivity;ActivityNum=03;SystemTime=2021/02/10-14:44:04."
    
    //console.log(scaneeopenid,signintype,activitynum,codetime)

  }
})