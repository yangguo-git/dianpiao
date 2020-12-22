// pages/electronicTable/electronicTable.js
const util = require('../../utils/util.js');
var common = require('../common.js');
var that;
var proStatus1, proStatus2, proStatus3;
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
    that = this;
    common.init.apply(this, []); //公共登录

    //从申办流程（submit_succ）进入， 传入图片和桌牌ID
    if (options.tableCardCode) {
      this.setData({
        tableCardCode: options.tableCardCode,
        tableCardImage: options.tableCardImage,
        laiyuan:options.laiyuan
      })
    } else {
      this.setData({
        laiyuan: options.laiyuan,
      })
      this.getTableCardImageForManager()

    }
  },
  getTableCardImageForManager() {
    let url = '/v1/customermanager/getTableCardImageForManager.do';
    this.pro_getSession.then(resolve => {
      let data = {
        session: wx.getStorageSync('session')
      }
      util.request(url, 'post', data, '加载中', (res) => {
        if (res.data.success) {
          console.log('res', res.data.module)
          let tableCardCode = res.data.module.tableCardCode;
          proStatus1 = res.data.module.proStatus1
          proStatus2 = res.data.module.proStatus2
          proStatus3 = res.data.module.proStatus3
          that.setData({
            tableCardCode,
            tableCardImage: res.data.module.tableCardImage,
          })
        } else {
          that.showToast_fail(res.data.errorMsg);
        }
      }, (err) => {

      })
    })
  },
  saveImg() {
    wx.downloadFile({
      url: this.data.tableCardImage,
      success(dow_res) {
        console.log('下载', dow_res)
        if (dow_res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: dow_res.tempFilePath,
            success(res) {
              console.log('保存成功')
              const savedFilePath = res.savedFilePath
              wx.showToast({
                title: '桌牌图片已保存至相册',
                icon: 'none'
              })
              if (!that.data.laiyuan) {
                setTimeout(() => {
                  var pro = '&proStatus1=' + proStatus1 + '&proStatus2=' + proStatus2 + '&proStatus3=' + proStatus3
                  wx.navigateTo({
                    url: '../packageChoice/packageChoice?tableCardCode=' + that.data.tableCardCode + pro,
                  })
                }, 1500);
              } else {
                wx.reLaunch({
                  url: '/pages/accountList/accountList',
                })
              }
            },fail(res) {
              console.log('保存失败')
              wx.showModal({
                title: '提示',
                content: '请打开保存图片授权',
                success (res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                    wx.openSetting({
                      success (res) {
                        console.log(res)
                        // res.authSetting = {
                        //   "scope.userInfo": true,
                        //   "scope.userLocation": true
                        // }
                      },fail(err){
                        console.log(err)
      
                      }
                    })
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            }
          })
        } else {
          wx.showToast({
            title: '保存失败，网络错误',
            icon: 'none'
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})