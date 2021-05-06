// pages/ymatch/kostage/kostage.js
const app = getApp();
var utiltime = require("../../../utils/Date.js")
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    groupList: ["Group A 1-8", "Group A 9-16", "Group B 1-8", "Group B 9-16"],
    groupIndex: 0,
    
    player1num: 0,
    player2num: 0,
    player1name: "",
    player2name: "",
    groupname: "",
  },

  lifetimes:{
    attached:async function(res){
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
      await new Promise((resolve,reject)=>{
        db.collection('yknockout').get({
          success:function(res){
            that.setData({
              kkdata: res.data
            })
            wx.hideLoading({});
            resolve();
          }
        })
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    attach:async function(res){
      var that = this;
      const db = wx.cloud.database();
      await new Promise((resolve,reject)=>{
        db.collection('yknockout').get({
          success:function(res){
            that.setData({
              kkdata: res.data
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
    enterscore:function(e){
      var that = this;
      var round = parseInt(e.currentTarget.id.slice(0,1));
      var num = parseInt(e.currentTarget.id.slice(2,3));
      console.log(that.data.groupList[that.data.groupIndex],round,num)
      if(num>=4)num-=4;
      that.setData({
        groupname: that.data.groupList[that.data.groupIndex],
        player1num: round,
        player2num: num,
        player1name: that.data.kkdata[that.data.groupIndex].player[round-1][2*(num+1)-2],
        player2name: that.data.kkdata[that.data.groupIndex].player[round-1][2*(num+1)-1],
      })
      console.log(that.data.player1name,that.data.player2name)
      var permitflag = that.data.permitgranted;
      permitflag = permitflag | (that.data.player1name == app.globalData.realname);
      permitflag = permitflag | (that.data.player2name == app.globalData.realname);

      if (permitflag) {
        that.popup.showPopup();
      } else {
        wx.showModal({
          title: "错误",
          content: "这不是您的比赛，不能代为录比分！",
          showCancel: false,
        })
      }
    }
  }
})
