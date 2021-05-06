// miniprogram/pages/STAT/STAT.js
const app = getApp();
let QR = require("../../utils/qrcode.js")
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js");
var utiltime = require('../../utils/Date.js');
//const { content } = require("../../utils/Chinese.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag: false,//member OK
    rflag: false,//haven't submitted application
    flag2: false,//submitted but invalid
    language: "中文",
    imagePath: "../../images/errorQR.png",
    maskHidden: true,
    realname: "",
    avatarUrl: "",
    classdate: 0,
    actionpoints: 0,
    activitylist: {},
    memberinfo: {},
    placesleft: {},
    showQR: false,
    intervalset: "",
    returndisable: false,
    signintext: "请给教练或网协工作人员扫描上面的二维码签到",
  },
  preventTouchMove: function () {
  },

  joinnow: function (e) {
    var that = this;
    if (app.globalData.logged == true) {
      wx.navigateTo({
        url: '../joinSTAT/joinSTAT',
      })
    }
    else {
      wx.showModal({
        title: that.data.content.modalwarning,
        content: that.data.content.reqlogin,
        showCancel: false,
        confirmText: that.data.content.confirmtext,
        success: function (res) {
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
  knowmore: function (e) {
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

  compare: function (a, b) {
    if (parseInt(a.month) == parseInt(b.month)) return parseInt(a.day) - parseInt(b.day);
    return parseInt(a.month) - parseInt(b.month);
  },
  loadactivities: function () {
    const db = wx.cloud.database();
    var that = this;
    db.collection('activities').get({
      success: async function (res) {
        await res.data.sort(that.compare);
        var j = 0;
        var activitylist = {};
        var today = {
          month: utiltime.formatMonth(new Date()),
          day: utiltime.formatDay(new Date())
        }
        for (var i = 1; i <= 16; i++) {
          if (that.compare(today, res.data[i - 1]) > 0) {
            continue;
          }
          activitylist[j++] = res.data[i - 1];
        }
        wx.hideLoading({});
        that.setData({
          activitylist: activitylist
        })
      }
    })
  },
  actsignup: function (e) {
    const db = wx.cloud.database();
    var that = this;
    if (that.data.actionpoints <= 0) {
      wx.showModal({
        title: that.data.content.modalwarning,
        content: "可参加活动数不足，请先取消报名不能参加的活动！",
        showCancel: false,
        success: function (res) {
          return;
        }
      })
    } else if (that.data.placesleft[e.currentTarget.id] <= 0) {
      wx.showModal({
        title: that.data.content.modalwarning,
        content: "所选择活动没有剩余名额，请与其它会员交换活动时间，并等待对方取消报名！",
        showCancel: false,
        success: function (res) {
          return;
        }
      })
    } else {
      wx.showLoading({
        title: 'Loading',
      })
      var memberinfotemp = that.data.memberinfo;
      var placesleft = that.data.placesleft;
      if (!memberinfotemp.z_act[parseInt(e.currentTarget.id)]) {
        memberinfotemp.z_act[parseInt(e.currentTarget.id)] = true;
        memberinfotemp.actionpoints = memberinfotemp.actionpoints - 1;
        placesleft[parseInt(e.currentTarget.id)] = placesleft[parseInt(e.currentTarget.id)] - 1;
        that.setData({
          memberinfo: memberinfotemp,
          actionpoints: that.data.actionpoints - 1,
          placesleft: placesleft
        })
        var z_act = that.data.memberinfo.z_act;
        var actionpoints = that.data.memberinfo.actionpoints;
        var string = that.data.memberinfo._id;
        db.collection('globalData').doc('XXZMNfdsX1oQeu3u').update({
          data: {
            placesleft: placesleft
          },
          success: function (res) {
            db.collection(app.globalData.groupName).doc(string).update({
              data: {
                z_act: z_act,
                actionpoints: actionpoints
              },
              success: function (res) {
                wx.hideLoading({});
                wx.showModal({
                  title: that.data.content.modalhint,
                  content: "报名成功！",
                  showCancel: false,
                  success(res) {
                    return;
                  }
                })
              }
            })
          }
        })
      } else {
        wx.hideLoading({});
        wx.showModal({
          title: that.data.content.modalwarning,
          content: "内部错误，您已经报名此活动",
          showCancel: false,
          success: function (res) {
            return;
          }
        })
      }
    }

  },
  cancelsignup: async function (e) {
    var that = this;
    const db = wx.cloud.database();
    wx.showModal({
      title: that.data.content.modalwarning,
      content: "您正在取消报名该活动，确认吗？",
      showCancel: true,
      success: async function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: 'Loading',
          })
          var placesleft = that.data.placesleft;
          var memberinfotemp = that.data.memberinfo;
          if (memberinfotemp.z_act[parseInt(e.currentTarget.id)]) {
            memberinfotemp.z_act[parseInt(e.currentTarget.id)] = false;
            memberinfotemp.actionpoints = memberinfotemp.actionpoints + 1;
            placesleft[parseInt(e.currentTarget.id)] = placesleft[parseInt(e.currentTarget.id)] + 1;
            that.setData({
              memberinfo: memberinfotemp,
              actionpoints: that.data.actionpoints + 1,
              placesleft: placesleft
            })
            var z_act = that.data.memberinfo.z_act;
            var actionpoints = that.data.memberinfo.actionpoints;
            var string = that.data.memberinfo._id
            await db.collection('globalData').doc('XXZMNfdsX1oQeu3u').update({
              data: {
                placesleft: placesleft
              }
            })
            db.collection(app.globalData.groupName).doc(string).update({
              data: {
                z_act: z_act,
                actionpoints: actionpoints
              },
              success: function (res) {
                wx.hideLoading({});
                wx.showModal({
                  title: that.data.content.modalhint,
                  content: "取消报名成功！",
                  showCancel: false,
                  success(res) {
                    return;
                  }
                })
              }
            })
          }
          else wx.showModal({
            title: that.data.content.modalwarning,
            content: "内部错误，您没有报名此活动",
            showCancel: false,
            success: function (res) {
              return;
            }
          })
        } else if (res.cancel) {
          return;
        }
      }
    })
  },
  hideQR: function (e) {
    var that = this;
    clearInterval(that.data.intervalset);
    that.setData({
      showQR: false,
      returndisable: false,
      signintext: "请给教练或网协工作人员扫描上面的二维码签到"
    })
  },
  clearinterval: function () {
    var that = this;
    const db = wx.cloud.database();
    clearInterval(that.data.intervalset);
    that.setData({
      imagePath: "../../images/scanned.png",
      returndisable: true,
      signintext: "扫码成功，请稍等"
    })
    db.collection(app.globalData.groupName).doc(that.data.memberinfo._id).update({
      data: {
        scanned: false
      }
    })
    setTimeout(() => {
      that.hideQR();
      that.onPullDownRefresh();
    }, 3000);
  },
  actsignin: async function (e) {
    var that = this;
    const db = wx.cloud.database();
    that.setData({
      maskHidden: false,
    });
    await new Promise((resolve, reject) => {
      wx.hideToast()
      var size = that.setCanvasSize();
      //绘制二维码
      var qrstring = "Status=OK;UserOpenID=";
      qrstring += that.data.memberinfo._openid;
      qrstring += ";SignInType=NormalActivity;ActivityNum="
      qrstring += parseInt(e.currentTarget.id) < 10 ? ("0" + parseInt(e.currentTarget.id)) : parseInt(e.currentTarget.id);
      qrstring += ";SystemTime="
      qrstring += utiltime.formatTime(new Date());
      qrstring += "."
      that.createQrCode(qrstring, "mycanvas", size.w, size.h);
      that.setData({
        maskHidden: true
      });
      resolve();
    }).catch((e) => { })
    that.setData({
      showQR: true
    })

    that.data.intervalset = setInterval(
      async function () {
        db.collection(app.globalData.groupName).doc(that.data.memberinfo._id).get({
          success: function (res) {
            if (res.data.scanned) {
              that.clearinterval();
            }
          }
        })
      }, 2000
    )
  },

  subscribe: function () {
    var that = this;
    wx.showModal({
      title: that.data.content.modalhint,
      content: that.data.content.subscribehint,
      showCancel: true,
      success: function (res) {
        if (res.cancel) {
          return;
        } else if (res.confirm) {
          wx.requestSubscribeMessage({
            tmplIds: ['DkpjVlo5Yb69uZzKSOfGeDPAkv_vPmbllN0y4W4W7s8'],
            complete: function (res) {
              console.log(res);
            }
          })
        }
      }
    })
  },
  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: async function (options) {
    wx.showLoading({
      title: '',
    })
    const db = wx.cloud.database();
    var that = this;
    var nickn = app.globalData.nickName;
    var avturl = app.globalData.avatarUrl;
    that.setData({
      realname: app.globalData.realname,
      avatarUrl: avturl
    })
    db.collection(app.globalData.groupName).where({
      realname: app.globalData.realname
      //nickname: nickn,
      //avatarurl: avturl
    }).get({
      success: function (res) {
        if (res.data.length == 0) {
          that.setData({
            flag: false,
            rflag: true
          })
          wx.hideLoading({});
        }
        else if (res.data[0].valid == true) {
          that.setData({
            flag: true,
            rflag: false,
            classdate: res.data[0].classdate,
            actionpoints: res.data[0].actionpoints,
            memberinfo: res.data[0]
          })
          that.loadactivities();
        }
        else {
          wx.hideLoading({});
          that.setData({
            flag2: true
          })
        }
      }
    })

    db.collection('globalData').doc('XXZMNfdsX1oQeu3u').get({
      success: function (res) {
        that.setData({
          placesleft: res.data.placesleft
        })
      }
    })

    var lan = app.globalData.language;
    that.setData({
      language: lan
    })
    var lastLanuage = that.data.language;
    that.getContent(lastLanuage);
  },

  onPullDownRefresh: async function (options) {
    var that = this;
    if (!that.data.flag) {
      wx.stopPullDownRefresh({
        success: (res) => { return; },
      })
    }
    const db = wx.cloud.database();
    var nickn = app.globalData.nickName;
    var avturl = app.globalData.avatarUrl;
    await new Promise((resolve, reject) => {
      db.collection(app.globalData.groupName).where({
        nickname: nickn,
        avatarurl: avturl
      }).get({
        success: function (res) {
          if (res.data.length == 0) {
            that.setData({
              flag: false,
              rflag: true,
              flag2: false
            })
            resolve();
          }
          else if (res.data[0].valid == true) {
            that.setData({
              flag: true,
              rflag: false,
              flag2: false,
              classdate: res.data[0].classdate,
              actionpoints: res.data[0].actionpoints,
              memberinfo: res.data[0]
            })
            that.loadactivities();
            resolve();
          }
          else {
            that.setData({
              flag: false,
              rflag: false,
              flag2: true
            })
            resolve();
          }
        }
      })
    }).catch((e) => { })


    await new Promise((resolve, reject) => {
      db.collection('globalData').doc('XXZMNfdsX1oQeu3u').get({
        success: function (res) {
          that.setData({
            placesleft: res.data.placesleft
          })
          resolve();
        }
      })
    }).catch((e) => { })

    wx.stopPullDownRefresh({
      success: (res) => { return; },
    })
  },
  tempbuttontap: function () {
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
  }
})