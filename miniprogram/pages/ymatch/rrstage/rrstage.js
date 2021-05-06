// pages/ymatch/rrstage/rrstage.js
const app = getApp();
var utiltime = require("../../../utils/Date.js")
Component({
  properties: {

  },
  data: {
    ygstds: {},
    groupList: ["A1", "B1"],
    groupIndex: 0,
    permitgranted: false,
    player1num: 0,
    player2num: 0,
    player1name: "",
    player2name: "",
    groupname: "",
  },
  lifetimes: {
    attached: async function () {
      wx.showLoading({
        title: 'Loading',
      })
      this.popup = this.selectComponent("#espopup");
      var that = this;
      const db = wx.cloud.database();
      if (app.globalData.permit >= 4) {
        that.setData({
          permitgranted: true
        })
      }
      await new Promise((resolve, reject) => {
        db.collection('ygroupstandings').get({
          success: function (res) {
            var grouplist = [];
            for (var i = 0; i < res.data.length; i++) {
              grouplist[i] = res.data[i].groupname;
            }
            that.setData({
              ygstds: res.data,
              groupList: grouplist
            })
            wx.hideLoading({});
            resolve();
          }
        })
      })
      console.log(that.data.groupList)
    }
  },
  methods: {
    attach: async function () {
      var that = this;
      const db = wx.cloud.database();
      await new Promise((resolve, reject) => {
        db.collection('ygroupstandings').get({
          success: function (res) {
            var grouplist = [];
            for (var i = 0; i < res.data.length; i++) {
              grouplist[i] = res.data[i].groupname;
            }
            that.setData({
              ygstds: res.data,
              groupList: grouplist
            })
            resolve();
          }
        })
      })
    },
    toleft: function (e) {
      var temp = this.data.groupList.length;
      var groupIndex = this.data.groupIndex;
      if (groupIndex == 0) groupIndex = temp - 1;
      else groupIndex--;
      this.setData({
        groupIndex: groupIndex
      })
    },
    toright: function (e) {
      var temp = this.data.groupList.length;
      var groupIndex = this.data.groupIndex;
      if (groupIndex == temp - 1) groupIndex = 0;
      else groupIndex++;
      this.setData({
        groupIndex: groupIndex
      })
    },
    bindPickerChange: function (e) {
      var that = this;
      that.setData({
        groupIndex: e.detail.value
      });
    },
    enterscore: function (e) {
      var that = this;
      const db = wx.cloud.database();
      var player1id = parseInt(e.currentTarget.id.slice(0, 1));
      var player2id = parseInt(e.currentTarget.id.slice(2, 3));
      that.setData({
        groupname: that.data.groupList[that.data.groupIndex],
        player1num: player1id,
        player2num: player2id,
        player1name: that.data.ygstds[that.data.groupIndex].player[player1id],
        player2name: that.data.ygstds[that.data.groupIndex].player[player2id],
      })
      var permitflag = false;
      permitflag = permitflag | (that.data.player1name == app.globalData.realname);
      permitflag = permitflag | (that.data.player2name == app.globalData.realname);
      permitflag = permitflag & (that.data.player1name !== "空");
      permitflag = permitflag & (that.data.player2name !== "空");
      permitflag = permitflag | that.data.permitgranted;

      if (permitflag) {
        this.popup.showPopup();
      } else {
        wx.showModal({
          title: "错误",
          content: "这不是您的比赛，不能代为录比分！",
          showCancel: false,
        })
      }
    },
    groupsort: async function () {
      var that = this;
      const db = wx.cloud.database();
      var groupdata = {};
      var player = [
        {
          id: 0,
          mwins: 0,
          mloss: 0,
          wins: 0,
          loss: 0,
        }, {
          id: 1,
          mwins: 0,
          mloss: 0,
          wins: 0,
          loss: 0,
        }, {
          id: 2,
          mwins: 0,
          mloss: 0,
          wins: 0,
          loss: 0,
        }, {
          id: 3,
          mwins: 0,
          mloss: 0,
          wins: 0,
          loss: 0,
        }
      ];
      var vics = [[false, false, false, false], [false, false, false, false], [false, false, false, false], [false, false, false, false]];
      await new Promise((resolve, reject) => {
        db.collection('ygroupstandings').where({
          groupname: that.data.groupList[that.data.groupIndex]
        }).get({
          success: function (res) {
            groupdata = res.data[0];
            resolve();
          }
        })
      })
      for (var i = 0; i <= 3; i++) {
        for (var j = i + 1; j <= 3; j++) {
          player[i].wins += groupdata.win[i][j];
          player[i].loss += groupdata.loss[i][j];
          player[j].wins += groupdata.win[j][i];
          player[j].loss += groupdata.loss[j][i];
          if (groupdata.win[i][j] != 0 || groupdata.win[j][i] != 0 || groupdata.loss[i][j] != 0 || groupdata.loss[j][i] != 0) {
            if ((groupdata.win[i][j] > groupdata.loss[i][j])) {
              vics[i][j] = true;
              player[i].mwins++;
              player[j].mloss++;
            } else if (groupdata.loss[i][j] >= groupdata.win[i][j]) {
              vics[j][i] = true;
              player[j].mwins++;
              player[i].mloss++;
            }
          }
        }
      }
      await new Promise((resolve, reject) => {
        player.sort((a, b) => {
          if (a.mwins != b.mwins) return a.mwins - b.mwins;
          if (a.mwins - a.mloss != b.mwins - b.mloss) return (a.mwins - a.mloss) - (b.mwins - b.mloss);
          if (a.wins != b.wins) return a.wins - b.wins;
          if (a.wins - a.loss != b.wins - b.loss) return (a.wins - a.loss) - (b.wins - b.loss);
          return (vics[a.id][b.id]) ? 1 : -1;
        })
        resolve();
      })

      await new Promise((resolve, reject) => {
        db.collection('ygroupstandings').doc(groupdata._id).update({
          data: {
            ['playerstds.' + [player[3].id]]: 1,
            ['playerstds.' + [player[2].id]]: 2,
            ['playerstds.' + [player[1].id]]: 3,
            ['playerstds.' + [player[0].id]]: 4
          },
          success: function (res) {
            wx.showToast({
              title: '排序完成',
            })
            that.attach();
            resolve();
          }
        })
      })
      await new Promise((resolve, reject) => {

      })
    },
    uploadgroupdata: async function () {
      var that = this;
      const db = wx.cloud.database();
      var kkdata,cgroupdata;
      await new Promise((resolve, reject) => {
        db.collection("yknockout").get({
          success: function (res) {
            kkdata = res.data
            resolve();
          }
        })
      })
      await new Promise((resolve, reject) => {
        db.collection("ygroupstandings").where({
          groupname: that.data.groupList[that.data.groupIndex]
        }).get({
          success: function (res) {
            cgroupdata = res.data[0]
            resolve();
          }
        })
      })
      console.log(cgroupdata)/*
      if(cgroupdata.player[0] === "空" || cgroupdata.player[1] === "空" || cgroupdata.player[2] === "空" || cgroupdata.player[3] === "空"){
        var kongid = 0;
        for(;kongid<=3;kongid++){
          if(cgroupdata.player[kongid] === "空")break;
        }
        var kongstd;
        switch(cgroupdata.groupname){
          case 'A':
          case 'E': kongstd = 1; break;
          case 'B':
          case 'F': kongstd = 2; break;
          case 'C':
          case 'G': kongstd = 3; break;
          case 'D':
          case 'H': kongstd = 4; break;
        }
        var kongprevstd = cgroupdata.playerstds[kongid];
        console.log(cgroupdata.playerstds)
        cgroupdata.playerstds[kongid]=kongstd;
        if(kongprevstd==kongstd){

        } else if(kongprevstd<kongstd){
          for(var k = 0;k<=3;k++){
            if(k == kongid)continue;
            if(cgroupdata.playerstds[k]<=kongstd && cgroupdata.playerstds[k]>=kongprevstd){
              cgroupdata.playerstds[k] -- ;
            }
          }
        } else {
          for(var k = 0;k<=3;k++){
            if(k == kongid)continue;
            if(cgroupdata.playerstds[k]>=kongstd && cgroupdata.playerstds[k]<=kongprevstd){
              cgroupdata.playerstds[k] ++ ;
            }
          }
        }
        console.log(cgroupdata.playerstds)
      }*/
      /****************************************************************************** */
      /*
      for (var i = 0; i <= 3; i++) {
        var j=0;
        for(;j<=3;j++){
          if(cgroupdata.playerstds[j]==i+1)break;
        }
        await new Promise((resolve,reject)=>{
          var string = "player.0." + that.data.groupIndex;
          db.collection('yknockout').doc(kkdata[i]._id).update({
            data:{
              [string]: cgroupdata.player[j]
            },
            success: function(res){
              resolve();
            }
          })
        })
      }*/

      if(that.data.groupIndex<4){
        for(var i=0;i<=3;i++){
          var j=0;
          for(;j<=3;j++){
            if(cgroupdata.playerstds[j]==i+1)break;
          }
          var k,m;
          if(i<=1){
            k = 4*i+that.data.groupIndex;
            m = 0;
          } else {
            k = 4*(i-2)+that.data.groupIndex;
            m = 1;
          }
          await new Promise((resolve,reject)=>{
            var string = "player.0." + k;
            console.log(kkdata[m].rank,cgroupdata.player[j],string)
            db.collection('yknockout').doc(kkdata[m]._id).update({
              data:{
                [string]: cgroupdata.player[j]
              },
              success: function(res){
                resolve();
              }
            })
          })
        }
      } else if(that.data.groupIndex>=4){
        for(var i=0;i<=3;i++){
          var j=0;
          for(;j<=3;j++){
            if(cgroupdata.playerstds[j]==i+1)break;
          }
          var k,m;
          if(i<=1){
            k = 4*i+that.data.groupIndex-4;
            m = 2;
          } else {
            k = 4*(i-2)+that.data.groupIndex-4;
            m = 3;
          }
          await new Promise((resolve,reject)=>{
            var string = "player.0." + k;
            db.collection('yknockout').doc(kkdata[m]._id).update({
              data:{
                [string]: cgroupdata.player[j]
              },
              success: function(res){
                resolve();
              }
            })
          })
        }
      }
      

      wx.showToast({
        title: '数据已推送',
      })
    },
    startthematch: async function(){
      var that = this;
      const db = wx.cloud.database();
      await new Promise((resolve,reject)=>{
        db.collection('globalData').doc('XXZMNfdsX1oQeu3u').update({
          data:{
            ongoingymatch: true
          },
          success: function(res){
            wx.showToast({
              title: '比赛已开始',
            })
          }
        })
      })
    },
    endthematch: async function(){
      var that = this;
      const db = wx.cloud.database();
      await new Promise((resolve,reject)=>{
        db.collection('globalData').doc('XXZMNfdsX1oQeu3u').update({
          data:{
            ongoingymatch: false
          },
          success: function(res){
            wx.showToast({
              title: '比赛已终止',
            })
          }
        })
      })
    }
  },
})
