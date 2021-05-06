// miniprogram/pages/enterscore/enterscore.js
const app = getApp();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
var date = require("../../utils/Date.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num: [0, 0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366],
    rounds: ["------"],
    roundsindex: 0,
    rounddelta: 0,
    winner: 0,
    subject: "一单",
    searched: false,
    language: "中文",
    dep1: "",
    dep2: "",
    score1: 0,
    score2: 0,
    permit: 0,
    flag: false,
    rflag: true,
    box1checked: false,
    box2checked: false,
    subjectarray: ["一单", "二单", "女单", "男双", "混双"],
    statusarray: ["FT", "Nor", "W.O.", "Ret.", "Def.", "Del.", "Int.", "Can."],
    statusindex: 0,
    status: "FT",
    subjectindex: 0,
    imatch: {},
    days: "0",
    found: false,
    enterscorenottoday: false,
    enterRR: true,
    enterKO: false,
    inputdisable: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    var lan = app.globalData.language;
    var that = this;
    const db = wx.cloud.database();
    this.setData({
      language: lan
    })
    var lastLanuage = this.data.language;
    this.getContent(lastLanuage);

    this.setData({
      permit: app.globalData.permit
    })
    if (app.globalData.permit >= 4)
      this.setData({
        flag: true,
        rflag: false
      })

    await new Promise((resolve, reject) => {
      db.collection('globalData').doc('XXZMNfdsX1oQeu3u').get({
        success: function (res) {
          that.setData({
            rounddelta: res.data.rounds,
            roundsindex: res.data.rounddefault,
            enterscorenottoday: res.data.enterscorenottoday
          })
          that.setrounds();
          resolve();
        }
      })
    }).catch((e) => { })

    var days = String(this.data.num[date.formatMonth(new Date())] + date.formatDay(new Date()));
    this.setData({
      days: days
    })
  },

  pow2: function (a) {
    var ans = 1;
    for (var i = 1; i <= a; i++) {
      ans = ans * 2;
    }
    return ans;
  },

  setrounds: function () {
    var that = this;
    var temp = ["------"];
    switch (that.data.rounddelta) {
      case 0: break;
      case 1: temp = ["Finals (2→1)", "Playoff"]; break;
      case 2: temp = ["Semi-Finals (4→2)", "Finals (2→1)", "Playoff"]; break;
      case 3: temp = ["Quarter-Finals (8→4)", "Semi-Finals (4→2)", "Finals (2→1)", "Playoff"]; break;
      case 4: temp = ["Round of 16 (16→8)", "Quarter-Finals (8→4)", "Semi-Finals (4→2)", "Finals (2→1)", "Playoff"]; break;
      case 5: temp = ["Round of 32 (32→16)", "Round of 16 (16→8)", "Quarter-Finals (8→4)", "Semi-Finals (4→2)", "Finals (2→1)", "Playoff"]; break;
      case 6: temp = ["Round of 64 (64→32)", "Round of 32 (32→16)", "Round of 16 (16→8)", "Quarter-Finals (8→4)", "Semi-Finals (4→2)", "Finals (2→1)", "Playoff"]; break;
      case 7: temp = ["Round of 128 (128→64)", "Round of 64 (64→32)", "Round of 32 (32→16)", "Round of 16 (16→8)", "Quarter-Finals (8→4)", "Semi-Finals (4→2)", "Finals (2→1)", "Playoff"]; break;
      default: break;
    }
    that.setData({
      rounds: temp
    })
  },

  toleft: function () {
    var that = this;
    var temp = that.data.roundsindex;
    if (temp == 0) return;
    that.setData({
      roundsindex: temp - 1
    })
  },
  toright: function () {
    var that = this;
    var temp = that.data.roundsindex;
    if (temp == that.data.rounddelta) return;
    that.setData({
      roundsindex: temp + 1
    })
  },
  bindroundschange: function (e) {
    var temp = parseInt(e.detail.value);
    var that = this;
    that.setData({
      roundsindex: temp
    })
  },

  rrkocheckboxchange: function (e) {
    console.log(e)
    var that = this;
    var enterrr, enterko;
    if (that.data.enterRR) {
      if (e.detail.value[0] === "rr") {
        if (e.detail.value[1] === "ko") enterrr = false, enterko = true;
        else enterrr = true, enterko = false;
      } else if (e.detail.value[0] === "ko") {
        enterrr = false, enterko = true;
      } else enterrr = true, enterko = false;
    } else if (that.data.enterKO) {
      if (e.detail.value[0] === "rr") {
        enterrr = true, enterko = false;
      } else if (e.detail.value[0] === "ko") {
        if (e.detail.value[1] === "rr") enterrr = true, enterko = false;
        else enterrr = false, enterko = true;
      } else enterrr = false, enterko = true;
    }
    that.setData({
      enterKO: enterko,
      enterRR: enterrr
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

  getstatus: function (e) {
    var temp = this.data.statusarray[e.detail.value];
    this.setData({
      statusindex: e.detail.value,
      status: temp
    })
  },
  binddep1: function (e) {
    this.setData({
      dep1: e.detail.value
    })
  },
  binddep2: function (e) {
    this.setData({
      dep2: e.detail.value
    })
  },
  getsubject: function (e) {
    var temp = this.data.subjectarray[e.detail.value];
    this.setData({
      subjectindex: e.detail.value,
      subject: temp
    })
  },
  getscore1: function (e) {
    if (e.detail.value == "") return;
    this.setData({
      score1: e.detail.value
    })
  },
  getscore2: function (e) {
    if (e.detail.value == "") return;
    this.setData({
      score2: e.detail.value
    })
  },

  search: async function () {
    const db = wx.cloud.database();
    var that = this;
    //console.log(that.data.days, that.data.subject, that.data.dep1, that.data.dep2)

    var searchisrr;
    if (that.data.enterKO) searchisrr = false;
    else if (that.data.enterRR) searchisrr = true;

    await Promise.all([new Promise((resolve, reject) => {
      db.collection('match').where({
        subject: that.data.subject,
        dep1: that.data.dep2,
        dep2: that.data.dep1,
        isRR: searchisrr,
        enteredscore: false
      }).get({
        success: function (res) {
          console.log(res)
          if (res.data.length != 0) that.setData({
            imatch: res.data[0],
            found: true,
            inputdisable: true
          })
          resolve();
        }
      })
    }).catch((e) => { }),
    new Promise((resolve, reject) => {
      db.collection('match').where({
        subject: that.data.subject,
        dep1: that.data.dep1,
        dep2: that.data.dep2,
        isRR: searchisrr,
        enteredscore: false
      }).get({
        success: function (res) {
          console.log(res)
          if (res.data.length != 0) that.setData({
            imatch: res.data[0],
            found: true,
            inputdisable: true
          })
          resolve();
        }
      })
    }).catch((e) => { })
    ])

    await new Promise((resolve, reject) => {
      if (!that.data.enterscorenottoday && parseInt(that.data.imatch.date) != parseInt(that.data.days)) {
        that.setData({
          found: false,
          imatch: {}
        })
        resolve();
      } else {
        resolve();
      }
    }).catch((e) => { })

    if (that.data.found) {
      await new Promise((resolve, reject) => {
        that.setData({
          searched: true
        })
        var timestring = String(parseInt(parseInt(that.data.imatch.time) / 100));
        timestring += ":";
        timestring += (parseInt(that.data.imatch.time) % 100 / 10 < 1) ?
          ("0" + String(parseInt(that.data.imatch.time) % 100)) :
          String(parseInt(that.data.imatch.time) % 100);
        var string = "imatch.time";
        that.setData({
          [string]: timestring
        })
        console.log(that.data.imatch)
      }).catch((e) => { })
    } else return;
  },

  checkboxchange: function (e) {
    if (e.detail.value[1] == "1") {
      this.setData({
        box1checked: true,
        box2checked: false,
        winner: 1
      })
    } else if (e.detail.value[1] == "2") {
      this.setData({
        box1checked: false,
        box2checked: true,
        winner: 2
      })
    } else if (e.detail.value[0] == "1") {
      this.setData({
        box1checked: true,
        box2checked: false,
        winner: 1
      })
    } else {
      this.setData({
        box1checked: false,
        box2checked: true,
        winner: 2
      })
    }
  },
  submit: async function () {
    var that = this;
    const db = wx.cloud.database();
    var string = that.data.imatch._id;
    if(that.data.imatch.dep1 !== that.data.dep1){
      var dep1 = that.data.dep2,dep2 = that.data.dep1;
      that.setData({
        dep1: dep1,
        dep2: dep2
      })
    }
    var enteredscore;
    if (that.data.status == "FT" || that.data.status == "W.O." || that.data.status == "Ret." || that.data.status == "Def.") enteredscore = true;
    else enteredscore = false;

    var warning = "当前比赛状态将更改为" + that.data.status + "，一旦提交将不可以再次修改比分，确认提交吗？";

    await new Promise((resolve, reject) => {
      if (enteredscore) {
        wx.showModal({
          title: "警告",
          content: warning,
          showCancel: true,
          success: function (res) {
            if (res.cancel) {
              return;
            } else {
              wx.showLoading({
                title: 'Loading',
              })
              resolve();
            }
          }
        })
      } else {
        wx.showLoading({
          title: 'Loading',
        })
        resolve();
      }
    }).catch((e) => { })

    //update match result and gamew/l in 'groupStands' or 'knockout'
    if (that.data.enterRR) {
      await new Promise(async (resolve, reject) => {
        var depdata = {};
        await new Promise((resolve, reject) => {
          db.collection('groupStandings').where({
            dep: that.data.dep1
          }).get({
            success: function (res) {
              depdata = res.data[0];
              resolve();
            }
          })
        }).catch((e) => { })
        await new Promise((resolve, reject) => {
          if (that.data.status != "Del." && that.data.status != "Int.") {
            depdata.gamew += parseInt(that.data.score1);
            depdata.gamel += parseInt(that.data.score2);
          }
          if (that.data.winner == 1) depdata.matchw++;
          else if (that.data.winner == 2) depdata.matchl++;
          resolve();
        }).catch((e) => { })
        await new Promise((resolve, reject) => {
          db.collection('groupStandings').doc(depdata._id).update({
            data: {
              gamew: depdata.gamew,
              gamel: depdata.gamel,
              matchw: depdata.matchw,
              matchl: depdata.matchl
            },
            success: function (res) {
              resolve();
            }
          })
        }).catch((e) => { })
        depdata = {};

        await new Promise((resolve, reject) => {
          db.collection('groupStandings').where({
            dep: that.data.dep2
          }).get({
            success: function (res) {
              depdata = res.data[0];
              resolve();
            }
          })
        }).catch((e) => { })
        await new Promise((resolve, reject) => {
          if (that.data.status != "Del." && that.data.status != "Int.") {
            depdata.gamew += parseInt(that.data.score2);
            depdata.gamel += parseInt(that.data.score1);
          }
          if (that.data.winner == 2) depdata.matchw++;
          else if (that.data.winner == 1) depdata.matchl++;
          resolve();
        }).catch((e) => { })
        await new Promise((resolve, reject) => {
          db.collection('groupStandings').doc(depdata._id).update({
            data: {
              gamew: depdata.gamew,
              gamel: depdata.gamel,
              matchw: depdata.matchw,
              matchl: depdata.matchl
            },
            success: function (res) {
              resolve();
            }
          })
        }).catch((e) => { })
        resolve();
      }).catch((e) => { })
    } else if (that.data.enterKO) {
      var nummax, nummin;
      switch (that.data.rounds[that.data.roundsindex]) {
        case "Round of 128 (128→64)": nummax = 511, nummin = 256; break;
        case "Round of 64 (64→32)": nummax = 255, nummin = 128; break;
        case "Round of 32 (32→16)": nummax = 127, nummin = 64; break;
        case "Round of 16 (16→8)": nummax = 63, nummin = 32; break;
        case "Quarter-Finals (8→4)": nummax = 31, nummin = 16; break;
        case "Semi-Finals (4→2)": nummax = 15, nummin = 8; break;
        case "Finals (2→1)": nummax = 7, nummin = 4; break;
        case "Playoff": nummax = 3, nummin = 2; break;
      }
      var pickervalid = true;
      var depdata1 = {};
      await new Promise((resolve, reject) => {
        db.collection("knockout").where({
          name: that.data.dep1,
          number: db.command.gte(nummin).and(db.command.lte(nummax))
        }).get({
          success: function (res) {
            if (res.data.length == 0) pickervalid = false;
            else {
              depdata1 = res.data[0];
            }
            resolve();
          }
        })
      }).catch((e) => { })

      var depdata2 = {};
      await new Promise((resolve, reject) => {
        db.collection("knockout").where({
          name: that.data.dep2,
          number: db.command.gte(nummin).and(db.command.lte(nummax))
        }).get({
          success: function (res) {
            if (res.data.length == 0) pickervalid = false;
            else {
              depdata2 = res.data[0];
            }
            resolve();
          }
        })
      }).catch((e) => { })

      await new Promise((resolve, reject) => {
        if (pickervalid == false) {
          wx.hideLoading({});
          var errorstring = "所选择的轮次：" + that.data.rounds[that.data.roundsindex] + "中没有找到对应的比赛，请选择正确的轮次！";
          wx.showModal({
            title: "错误",
            content: errorstring,
            showCancel: false,
            success: function (res) {
              return;
            }
          })
        }
        else resolve();
      }).catch((e) => { })
      await new Promise(async (resolve, reject) => {
        switch (that.data.subjectarray[that.data.subjectindex]) {
          case "一单": {
            depdata1.ms1n = false;
            depdata2.ms1n = false;
            depdata1.ms1s = parseInt(that.data.score1);
            depdata2.ms1s = parseInt(that.data.score2);
            if (that.data.winner == 1) { depdata1.ms1 = true; depdata1.matchw++; }
            else if (that.data.winner == 2) { depdata2.ms1 = true; depdata2.matchw++; }
          } break;
          case "二单": {
            depdata1.ms2n = false;
            depdata2.ms2n = false;
            depdata1.ms2s = parseInt(that.data.score1);
            depdata2.ms2s = parseInt(that.data.score2);
            if (that.data.winner == 1) { depdata1.ms2 = true; depdata1.matchw++; }
            else if (that.data.winner == 2) { depdata2.ms2 = true; depdata2.matchw++; }
          } break;
          case "女单": {
            depdata1.wsn = false;
            depdata2.wsn = false;
            depdata1.wss = parseInt(that.data.score1);
            depdata2.wss = parseInt(that.data.score2);
            if (that.data.winner == 1) { depdata1.ws = true; depdata1.matchw++; }
            else if (that.data.winner == 2) { depdata2.ws = true; depdata2.matchw++; }
          } break;
          case "男双": {
            depdata1.doun = false;
            depdata2.doun = false;
            depdata1.dous = parseInt(that.data.score1);
            depdata2.dous = parseInt(that.data.score2);
            if (that.data.winner == 1) { depdata1.dou = true; depdata1.matchw++; }
            else if (that.data.winner == 2) { depdata2.dou = true; depdata2.matchw++; }
          } break;
          case "混双": {
            depdata1.mdn = false;
            depdata2.mdn = false;
            depdata1.mds = parseInt(that.data.score1);
            depdata2.mds = parseInt(that.data.score2);
            if (that.data.winner == 1) { depdata1.md = true; depdata1.matchw++; }
            else if (that.data.winner == 2) { depdata2.md = true; depdata2.matchw++; }
          } break;
        }
        await Promise.all([new Promise((resolve, reject) => {
          db.collection('knockout').doc(depdata1._id).update({
            data: {
              matchw: depdata1.matchw,
              ms1: depdata1.ms1,
              ms1n: depdata1.ms1n,
              ms1s: depdata1.ms1s,
              ms2: depdata1.ms2,
              ms2n: depdata1.ms2n,
              ms2s: depdata1.ms2s,
              ws: depdata1.ws,
              wsn: depdata1.wsn,
              wss: depdata1.wss,
              dou: depdata1.dou,
              doun: depdata1.doun,
              dous: depdata1.dous,
              md: depdata1.md,
              mdn: depdata1.mdn,
              mds: depdata1.mds,
            },
            success: function (res) {
              resolve();
            }
          })
        }).catch((e) => { }),
        new Promise((resolve, reject) => {
          db.collection('knockout').doc(depdata2._id).update({
            data: {
              matchw: depdata2.matchw,
              ms1: depdata2.ms1,
              ms1n: depdata2.ms1n,
              ms1s: depdata2.ms1s,
              ms2: depdata2.ms2,
              ms2n: depdata2.ms2n,
              ms2s: depdata2.ms2s,
              ws: depdata2.ws,
              wsn: depdata2.wsn,
              wss: depdata2.wss,
              dou: depdata2.dou,
              doun: depdata2.doun,
              dous: depdata2.dous,
              md: depdata2.md,
              mdn: depdata2.mdn,
              mds: depdata2.mds,
            },
            success: function (res) {
              resolve();
            }
          })
        }).catch((e) => { })
        ])
        resolve();
      }).catch((e) => { })
    }

    //update match result in collection 'match'
    await new Promise((resolve, reject) => {
      db.collection("match").doc(string).update({
        data: {
          status: that.data.status,
          score1: that.data.score1,
          score2: that.data.score2,
          winner: that.data.winner,
          enteredscore: enteredscore
        },
        success: function (res) {
          resolve();
        }
      })
    }).catch((e) => { })

    wx.hideLoading({});
    wx.showModal({
      title: '提示',
      content: '比分提交成功',
      showCancel: false,
      complete: function (res) {
        wx.navigateBack({
          complete: (res) => { },
        })
      }
    })

  }
})