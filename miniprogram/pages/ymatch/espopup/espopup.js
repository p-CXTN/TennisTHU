// pages/ymatch/enterscorepopup/espopup.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {            // 属性名
      type: String,     // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '录比分'     // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    name1: {
      type: String,
      value: '球员1'
    },
    name2: {
      type: String,
      value: '球员2'
    },
    player1: {
      type: Number,
      value: 0
    },
    player2: {
      type: Number,
      value: 0
    },
    group: {
      type: String,
      value: "A"
    },
    matchtype: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    flag: false,
    score1: 0,
    score2: 0,
    groupdata: {},
  },

  /**
   * 组件的方法列表
   */
  methods: {
    hidePopup: function () {
      this.setData({
        flag: false
      })
    },
    showPopup() {
      var that = this;
      this.setData({
        flag: true
      })
    },
    _cancel() {
      this.hidePopup();
      this.setData({
        score1: "",
        score2: ""
      })
    },
    _success: async function () {
      var that = this;
      const db = wx.cloud.database();
      var ongoingmatch = false;
      await new Promise((resolve, reject) => {
        db.collection("globalData").doc('XXZMNfdsX1oQeu3u').get({
          success: function (res) {
            ongoingmatch = res.data.ongoingymatch;
            resolve();
          }
        })
      })
      if (!ongoingmatch) {
        wx.showModal({
          title: "错误",
          content: "比赛尚未开始或已结束",
          showCancel: false
        })
        that.hidePopup();
        return;
      }
      console.log(that.data.score1,that.data.score2)
      if ((that.data.score1 == 0 || that.data.score1 == 1 || that.data.score1 == 2 || that.data.score1 == 3) &&
        (that.data.score2 == 0 || that.data.score2 == 1 || that.data.score2 == 2 || that.data.score2 == 3) && (that.data.score1 + that.data.score2 < 6) && (that.data.score1 + that.data.score2 >= 2)) {
        if (that.properties.matchtype == 1) {
          that.hidePopup();
          wx.showLoading({
            title: 'Loading',
          })
          await new Promise((resolve, reject) => {
            db.collection('ygroupstandings').where({
              groupname: that.properties.group
            }).get({
              success: function (res) {
                that.setData({
                  groupdata: res.data[0]
                })
                resolve();
              }
            })
          })
          if (that.data.groupdata.win[that.properties.player1][that.properties.player2] == 0 &&
            that.data.groupdata.win[that.properties.player2][that.properties.player1] == 0 &&
            that.data.groupdata.loss[that.properties.player1][that.properties.player2] == 0 &&
            that.data.groupdata.loss[that.properties.player2][that.properties.player1] == 0) {
            await new Promise((resolve, reject) => {
              var string1 = "win." + that.properties.player1 + "." + that.properties.player2;
              var string2 = "win." + that.properties.player2 + "." + that.properties.player1;
              var string3 = "loss." + that.properties.player1 + "." + that.properties.player2;
              var string4 = "loss." + that.properties.player2 + "." + that.properties.player1;
              db.collection('ygroupstandings').doc(that.data.groupdata._id).update({
                data: {
                  [string1]: db.command.inc(that.data.score1),
                  [string2]: db.command.inc(that.data.score2),
                  [string3]: db.command.inc(that.data.score2),
                  [string4]: db.command.inc(that.data.score1),
                },
                success: function (res) {
                  wx.hideLoading({});
                  wx.showToast({
                    title: '比分提交成功',
                  })
                  that.triggerEvent("attach");
                  resolve();
                }
              })
            })
          } else if (app.globalData.permit >= 4) {
            wx.hideLoading({});
            wx.showModal({
              title: "警告",
              content: "当前比赛比分已提交，要覆盖吗？",
              success: async function (res) {
                if (res.confirm) {
                  wx.showLoading({
                    title: 'Loading',
                  })
                  await new Promise((resolve, reject) => {
                    var string1 = "win." + that.properties.player1 + "." + that.properties.player2;
                    var string2 = "win." + that.properties.player2 + "." + that.properties.player1;
                    var string3 = "loss." + that.properties.player1 + "." + that.properties.player2;
                    var string4 = "loss." + that.properties.player2 + "." + that.properties.player1;
                    db.collection('ygroupstandings').doc(that.data.groupdata._id).update({
                      data: {
                        [string1]: that.data.score1,
                        [string2]: that.data.score2,
                        [string3]: that.data.score2,
                        [string4]: that.data.score1,
                      },
                      success: function (res) {
                        wx.hideLoading({});
                        wx.showToast({
                          title: '比分提交成功',
                        })
                        that.triggerEvent("attach");
                        resolve();
                      }
                    })
                  })
                }
              }
            })
          } else {
            wx.hideLoading({});
            wx.showModal({
              title: "错误",
              content: "当前比赛比分已经提交，不能更改",
              showCancel: false
            })
          }
        } else if (that.properties.matchtype == 2) {
          that.hidePopup();
          wx.showLoading({
            title: 'Loading',
          })
          await new Promise((resolve, reject) => {
            db.collection('yknockout').where({
              rank: that.properties.group
            }).get({
              success: function (res) {
                that.setData({
                  groupdata: res.data[0]
                })
                resolve();
              }
            })
          })
          if (that.data.groupdata.score[that.properties.player1 - 1][2 * (that.properties.player2 + 1) - 2] == 0 &&
            that.data.groupdata.score[that.properties.player1 - 1][2 * (that.properties.player2 + 1) - 1] == 0) {
            await new Promise((resolve, reject) => {
              var string1 = "score." + (that.properties.player1 - 1) + "." + (2 * (that.properties.player2 + 1) - 2);
              var string2 = "score." + (that.properties.player1 - 1) + "." + (2 * (that.properties.player2 + 1) - 1);
              var string3 = "player." + (that.properties.player1) + "." + (that.properties.player2);
              var string4 = "player." + (that.properties.player1) + "." + (that.properties.player2 + 4);
              var winner = "", loser = "";
              if (that.data.score1 == 2) winner = that.properties.name1, loser = that.properties.name2;
              else if (that.data.score2 == 2) winner = that.properties.name2, loser = that.properties.name1;
              db.collection('yknockout').doc(that.data.groupdata._id).update({
                data: {
                  [string1]: that.data.score1,
                  [string2]: that.data.score2,
                  [string3]: winner,
                  [string4]: loser,
                },
                success: function (res) {
                  wx.hideLoading({});
                  wx.showToast({
                    title: '比分提交成功',
                  })
                  that.triggerEvent("attach");
                  resolve();
                }
              })
            })
          } else if (app.globalData.permit >= 4) {
            wx.hideLoading({});
            wx.showModal({
              title: "警告",
              content: "当前比赛比分已提交，要覆盖吗？",
              success: async function (res) {
                if (res.confirm) {
                  wx.showLoading({
                    title: 'Loading',
                  })
                  await new Promise((resolve, reject) => {
                    var string1 = "score." + (that.properties.player1 - 1) + "." + (2 * (that.properties.player2 + 1) - 2);
                    var string2 = "score." + (that.properties.player1 - 1) + "." + (2 * (that.properties.player2 + 1) - 1);
                    var string3 = "player." + (that.properties.player1) + "." + (that.properties.player2);
                    var string4 = "player." + (that.properties.player1) + "." + (that.properties.player2 + 4);
                    var winner = "", loser = "";
                    if (that.data.score1 == 2) winner = that.properties.name1, loser = that.properties.name2;
                    else if (that.data.score2 == 2) winner = that.properties.name2, loser = that.properties.name1;
                    db.collection('yknockout').doc(that.data.groupdata._id).update({
                      data: {
                        [string1]: that.data.score1,
                        [string2]: that.data.score2,
                        [string3]: winner,
                        [string4]: loser,
                      },
                      success: function (res) {
                        wx.hideLoading({});
                        wx.showToast({
                          title: '比分提交成功',
                        })
                        that.triggerEvent("attach");
                        resolve();
                      }
                    })
                  })
                }
              }
            })
          } else {
            wx.hideLoading({});
            wx.showModal({
              title: "错误",
              content: "当前比赛结果已经提交，不能更改",
              showCancel: false
            })
          }
        }
      } else {
        wx.showModal({
          title: '错误',
          content: "比分无效",
          showCancel: false
        })
      }

    },
    getscore: function (e) {
      if (e.currentTarget.id === "score1") {
        this.setData({
          score1: parseInt(e.detail.value)
        })
      } else if (e.currentTarget.id === "score2") {
        this.setData({
          score2: parseInt(e.detail.value)
        })
      }
    }
  }
})
