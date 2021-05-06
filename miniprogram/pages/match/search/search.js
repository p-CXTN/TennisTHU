// pages/match/search/search.js
const app = getApp();
var chinese = require("../../../utils/Chinese.js")
var english = require("../../../utils/English.js")
var date = require("../../../utils/Date.js")
var len = 0;
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
    num:[0,31,59,90,120,151,181,212,243,273,304,334,365],
    language: "",
    date:"2021-01-01",
    currentDay:1,
    nomatch: false,
    gotdata: {},
    dataList2: {},
    matchList: {},
    dataRecv: {},
    multiArray: [['紫荆', '综体东','综体西'], ['#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8', '#9', '#10', '#11', '#12', '#13', '#14', '#15', '#16']],
    multiIndex: [0, 0],
    rev:"101",
    rev_t:0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindMultiPickerChange: function (e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      this.setData({
        multiIndex: e.detail.value
      })
      var temp = String(this.data.multiIndex[0]+1) ;
      temp += (e.detail.value[1]+1)/10<1?('0'+String(e.detail.value[1]+1)):String(e.detail.value[1]+1);
      this.setData({
        rev: temp
      })
      var rev_t = this.convert(temp);
      this.setData({
        rev_t: rev_t
      })
      //this.attach();
    },
    bindMultiPickerColumnChange: function (e) {
      var data = {
        multiArray: this.data.multiArray,
        multiIndex: this.data.multiIndex
      };
      data.multiIndex[e.detail.column] = e.detail.value;
      switch (e.detail.column) {
        case 0:
          switch (data.multiIndex[0]) {
            case 0:
              data.multiArray[1] = ['#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8', '#9', '#10', '#11', '#12', '#13', '#14', '#15', '#16'];
              break;
            case 1:
              data.multiArray[1] = ['#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8', '#9'];
              break;
            case 2:
              data.multiArray[1] = ['#1', '#2', '#3', '#4', '#5', '#6'];
              break;
          }
          data.multiIndex[1] = 0;
          console.log(data.multiIndex);
          break;
      }
      this.setData(data);
    },
    bindDateChange:function(e){
      //console.log(parseInt(e.detail.value.substring(5,7)),parseInt(e.detail.value.substring(8,10)));
      //!!------if(this.data.date == e.detail.value)return;
      this.setData({
        date: e.detail.value
      })
      var days = this.data.num[parseInt(e.detail.value.substring(5,7))-1] + parseInt(e.detail.value.substring(8,10));
      //console.log(days)
      this.setData({
        currentDay: days
      })
      this.attach();
    },
    convert:function(a){
      var a1 = parseInt(a);
      var str = 0;//16,9,6
      var b = Math.ceil(a1/100)-1;
      switch(b){
        case 1: str = 0;break;
        case 2: str = 16;break;
        case 3: str = 25;break;
      }
      str += parseInt(a.substring(1,3));
      return str-1;
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
    compare:function(a,b){
      if(a.rev!=b.rev)return parseInt(a.rev)-parseInt(b.rev);
      return parseInt(a.No-b.No);
    },
    toleft:function(){
      var temp = this.data.multiIndex;
      if(this.data.multiIndex[1]==0){
        /*switch(this.data.multiIndex[0]){
          case 0: temp[1] = 15;break;
          case 1: temp[1] = 8;break;
          case 2: temp[1] = 5;break;
        }*/
        temp[1] = this.data.multiArray[1].length - 1;
      }
      else {
        temp[1] = temp[1] - 1;
      }
      var str = String(temp[0]+1);
      str += temp[1]>=9?String(temp[1]+1):('0'+String(temp[1]+1))
      this.setData({
        rev: str,
        multiIndex: temp
      })
      var rev_t = this.convert(this.data.rev);
      this.setData({
        rev_t: rev_t
      })
    },
    toright:function(){
      var temp = this.data.multiIndex;
      /*switch(temp[0]){
        case 0:if(temp[1]==15)temp[1]=0;else temp[1]++;break;
        case 1:if(temp[1]==8)temp[1]=0;else temp[1]++;break;
        case 2:if(temp[1]==5)temp[1]=0;else temp[1]++;break;
      }*/
      if(temp[1] == this.data.multiArray[1].length - 1)temp[1]=0;
      else temp[1]++;
      var str = String(temp[0]+1);
      str += temp[1]>=9?String(temp[1]+1):('0'+String(temp[1]+1))
      this.setData({
        rev: str,
        multiIndex: temp
      })
      var rev_t = this.convert(this.data.rev);
      this.setData({
        rev_t: rev_t
      })
    },
    convertdate: function(a){
      var that = this;
      var j=0;
      while(that.data.num[j]<a)j++;
      //console.log(j,a-that.data.num[j-1]) this is the date
      var string = "2021-";
      string += j<10?("0"+String(j)):String(j);
      string += "-";
      string += String(a-that.data.num[j-1]);
      return string;
    },
    
    attach:async function () {
      var that = this;
      that.setData({
        dataList2: {},
        matchList: {}
      });

      let i=0,j=0;
      await new Promise((resolve,reject)=>{
        for(;i<len;i++){
          if(parseInt(that.data.gotdata[i].date)!=that.data.currentDay)continue;
          var temp = that.data.gotdata[i];
          //if(i<10)console.log(that.data.gotdata[i].time)
          var string = "dataList2[" + j + "]";
          that.setData({
            [string]: temp
          });
          j++;
        }
        if(i==len)resolve();
      }).catch((e) => {})

      return await new Promise((resolve,reject)=>{
        if(j==0){
          that.setData({
            nomatch:true
          })
          return;
        }
        else {
          that.setData({
            nomatch: false
          })
        }
        
        that.data.dataList2.sort(that.compare);
        var crev=0;
        var len = j;let ii=0;
        var revlist = [];
        while(ii<len)
        {
          let jj=0;
          var currentrev = that.data.dataList2[ii].rev;
          revlist[crev] = '#' + that.data.dataList2[ii].rev.slice(1,3);
          for(;ii<len && that.data.dataList2[ii].rev==currentrev;ii++,jj++)
          {
            var obj = that.data.dataList2[ii];
            var string = "matchList[" + crev + "][" + jj +"]";
            that.setData({
              [string]: obj
            })

          }
          crev++;
        }
        console.log(revlist)
        var multiArray = [['紫荆', '综体东','综体西'],revlist];
        that.setData({
          multiArray: multiArray
        })
        wx.hideLoading({
          success: (res) => {resolve();},
        })
      }).catch((e) => {})
    },
    
  },

  attached:async function(){
    const db = wx.cloud.database();
    var that = this;
    wx.showLoading({
      title: 'Loading',
    })
    await new Promise((resolve,reject)=>{
      db.collection("globalData").doc("XXZMNfdsX1oQeu3u").get({
        success:function(res){
          var temp = that.convertdate(res.data.searchCurdays);
          that.setData({
            currentDay: res.data.searchCurdays,
            date: temp
          })
          resolve();
        }
      })
    }).catch((e) => {})
    
    var lan = app.globalData.language;
    this.setData({
      language: lan
    })
    var lastLanuage = this.properties.language;
    this.getContent(lastLanuage);

    await new Promise((resolve,reject)=>{
      wx.cloud.callFunction({
        name:'getmatches',
        complete: res=>{
          console.log(res.result.data)
          that.setData({
            gotdata: res.result.data,
            //dataRecv: res.result.data
          })
          if(res.result.data.length==0){
            that.setData({
              nomatch:true
            })
            wx.hideLoading({});
            return;
          }
          else {
            len = res.result.data.length
          }
          resolve();
        }
      })
    }).catch((e) => {})
    
    await that.attach();
  }


})
