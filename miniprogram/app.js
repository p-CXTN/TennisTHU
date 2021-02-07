//app.js

App({
  globalData: {
    avatarUrl: "index/user-unlogin.png",
    userInfo: null,
    realname: "",
    nickName:"",
    groupName:"",
    matchtitle:"",
    language: "中文",
    permit: 0,
    cloudid: "",
    logged: false,
    criticalPermission: 6,
    vpermitgranted: false,
  },
  onLaunch: function () {
    (async () => {
      const p = await new Promise(resolve => {
          setTimeout(() => resolve("async/await test OK"), 1000);
      });
      console.log(p);
    })();
    wx.hideShareMenu()
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    
  }
})
