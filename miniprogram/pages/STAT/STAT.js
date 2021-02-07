// miniprogram/pages/STAT/STAT.js
const app = getApp();
let QR = require("../../utils/qrcode.js")
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js");
const { content } = require("../../utils/Chinese.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag:false,//member OK
    rflag:false,//haven't submitted application
    flag2:false,//submitted but invalid
    language: "中文",
    imagePath: "../../images/qrcode.jpg",
    maskHidden: true,
    realname: "",
    avatarUrl: "",
    classdate: 0,
    actionpoints: 0,
  },

  joinnow:function(e){
    var that = this;
    if(app.globalData.logged==true)
    {
      wx.navigateTo({
        url: '../joinSTAT/joinSTAT',
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
  knowmore: function(e){
    wx.navigateTo({
      url: '../STATinfo/STATinfo',
    })
  },

  createQrCode: function (url, canvasId, cavW, cavH) {
    //调用插件中的draw方法，绘制二维码图片
    QR.api.draw(url, canvasId, cavW, cavH, this, this.canvasToTempImage);
    // setTimeout(() => { this.canvasToTempImage();},100);

  },
  //获取临时缓存照片路径，存入data中
  canvasToTempImage: function () {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        console.log(tempFilePath);
        that.setData({
          imagePath: tempFilePath,
        });
      },
      fail: function (res) {
        console.log(res);
      }
    }, that);
  },
  //适配不同屏幕大小的canvas
  setCanvasSize: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var scale = 750 / 686; //不同屏幕下canvas的适配比例；设计稿是750宽
      var width = res.windowWidth / scale;
      var height = width; //canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    return size;
  },
    /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const db = wx.cloud.database();
    var that = this;
    var nickn = app.globalData.nickName;
    var avturl = app.globalData.avatarUrl;
    that.setData({
      realname: app.globalData.realname,
      avatarUrl: avturl
    })
    db.collection(app.globalData.groupName).where({
      nickname: nickn,
      avatarurl: avturl
    }).get({
      success: function(res){
        console.log(res)
        if(res.data.length == 0)
        {
          that.setData({
            flag: false,
            rflag: true
          })
        }
        else if(res.data[0].valid==true)
        {
          that.setData({
            flag: true,
            rflag: false,
            classdate: res.data[0].classdate,
            actionpoints: res.data[0].actionpoints
          })
        }
        else
        {
          that.setData({
            flag2: true,
            classdate: res.data[0].classdate,
            actionpoints: res.data[0].actionpoints
          })
        }
      }
    })

    var lan = app.globalData.language;
    that.setData({
      language: lan
    })
    var lastLanuage = that.data.language;
    that.getContent(lastLanuage);
  },
  tempbuttontap: function (){
    var that = this;
    that.setData({
      maskHidden: false,
    });
    wx.showToast({
      title: '二维码已更新',
    })
    var st = setTimeout(function () {
      wx.hideToast()
      var size = that.setCanvasSize();
      //绘制二维码
      that.createQrCode('24uijfksd09qureiojf98fu34r8fuoisdj9823puqiowsldjf98y3hudfhdsnnkxclaskk9q23882uroi98uasdf9uh92ewcfusdj98qwoeirweoihfgd9w8e', "mycanvas", size.w, size.h);
      that.setData({
        maskHidden: true
      });
      clearTimeout(st);
    }, 10)
  },
  temp2buttontap: function(){
    wx.scanCode({
      success: function(res){
        console.log(res)
      }
    })
  }
})