// pages/contactPage/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  completemessage(e) {
    console.log(e);
    const { errcode } = e.detail;
    if (errcode === 0) {
      wx.showToast({
        title: '请在服务通知中添加企业微信客服',
        icon: 'none',
      })
    } else if (errcode === -3006) {
      wx.showToast({
        title: '请在服务通知中添加企业微信客服',
        icon: 'none',
      })
    }
  }
})