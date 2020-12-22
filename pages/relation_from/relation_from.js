var that;
const util = require('../../utils/util.js');
var common = require('../common.js');
var getBizlicenseByUpload_setTimeout,getBizlicenseByUpload_setTimeout_time;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btn_click:true,
    phoneNamber:'',
    mchRegisNo:'',
    money:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    common.init.apply(this, []); //公共登录
    this.setData({
      tableCardCode: options.tableCardCode
    })
    try {

      var res = wx.getSystemInfoSync()
      if (res.platform=='ios'){
        this.setData({
          topheight:'-10'
        })
      }else{
        this.setData({
          topheight: '8'
        })
      }
      console.log(res.platform)

    } catch (e) {

      // Do something when catch error

    }
  },

  openScanCode() {
    this.pro_getSession.then(resolve => {
      wx.chooseImage({
        success(res) {
          that.setData({
            disabled: true,
          })
          wx.showLoading({
            title: '识别中···'
          })
          const tempFilePaths = res.tempFilePaths
          wx.uploadFile({
            url: getApp().load_url + '/uploadBizlicense.do?session=' + wx.getStorageSync('session'), // 仅为示例，非真实的接口地址
            filePath: tempFilePaths[0],
            name: 'file',
            formData: {},
            success(res) {
              console.log('000000000', res)
              that.setData({
                disabled: false,
              })
              if (res.statusCode == 413) {
                wx.hideLoading();
                that.showToast_fail('识别失败')
              }
              try {
                const data = JSON.parse(res.data).module.taskId
                console.log('111', data)
                getBizlicenseByUpload_setTimeout_time = new Date().getTime()
                that.getBizlicenseByUpload(data)
              }catch(err){}
              // do something
            }, fail: function (err) {
              that.setData({
                disabled: false
              })
            }
          })
        }
      })
    })
  },
  getBizlicenseByUpload(mid) {

    let url = '/v1/customermanager/getBizlicenseByUpload.do';
    this.pro_getSession.then(resolve => {
      let data = {
        mid: mid,
        session: wx.getStorageSync('session'),
      }
      util.request(url, 'post', data, '', (res) => {

        if (res.data.success) {
          that.setData({
            name: '',
            mchRegisNo: '',
            legalRepre: '',
            mchAddress: '',
            disabled:false
          })
          wx.hideLoading();
          res.data.module.tableCardCode = that.data.tableCardCode;
          if (res.data.module.toastMessage) {
            var toastMessage = res.data.module.toastMessage;
            that.setData({
              ...res.data.module
            })
            that.showToast_fail(toastMessage, 3500)
          } else {
            that.setData({
              ...res.data.module
            })
          }
        } else {
          if (res.data.errorCode == '30023') {
            that.showToast_fail(res.data.errorMsg)
          } else {
            if (new Date().getTime() < getBizlicenseByUpload_setTimeout_time + 1000 * 15) {
              setTimeout(() => {
                that.getBizlicenseByUpload(mid);
              }, 1000)
            } else {
              that.setData({
                disabled: false
              })
              wx.hideLoading();
              that.showToast_fail('未识别成功，请重新识别')
            }
          }
        }
      }, (err) => {

      })
    })
  },
  // 26.客户经理提交商户信息接口
  addMchInfoForManager() {
    if (this.data.phoneNamber==''){
      this.showToast_fail('请输入商户联系方式')
      return
    }
    if (this.data.mchRegisNo == '') {
      this.showToast_fail('请输入商户营业执照税号')
      return
    }
    if (this.data.name == '') {
      this.showToast_fail('请输入商户名称')
      return
    }
    if (!util.regNumber(this.data.phoneNamber)) {
      this.showToast_fail('请输入正确的手机号码')
      return
    }
    let url = '/v1/customermanager/addMchInfoForManager.do';
    this.pro_getSession.then(resolve => {
      let data = {
        session: wx.getStorageSync('session'),
        tableCard: this.data.tableCardCode,
        mchName: this.data.name,
        phone: this.data.phoneNamber,
        legalRepre: this.data.legalRepre,
        regisCapital: this.data.regisCapital,
        businessScope: this.data.businessScope,
        mchType: this.data.companyType,
        busnissTerm: this.data.busnissTerm,
        mchAddress: this.data.mchAddress,
        mchRegisNo: this.data.mchRegisNo,   // 税号
      }
      util.request(url, 'post', data, '', (res) => {
        if (res.data.success) {
          console.log('addMchInfoForManager返回的信息', res.data)
          that.setData({
            btn_click:false
          })
          wx.navigateTo({
            url: '../submit_succ/submit_succ?id=' + res.data.module.id + '&tableCardCode=' + that.data.tableCardCode,
          })
        } else {
        that.showToast_fail(res.data.errorMsg)
        }
      }, (err) => {

      })
    })
  },

  input_name(e) {
    this.setData({
      name: e.detail.value
    })
  },
  input_mchRegisNo(e) {
    this.setData({
      mchRegisNo: e.detail.value
    })
  },
  input_companyType(e) {
    this.setData({
      companyType: e.detail.value
    })
  }, 
  input_mchAddress(e) {
    this.setData({
      mchAddress: e.detail.value
    })
  },
  input_legalRepre(e) {
    this.setData({
      legalRepre: e.detail.value
    })
  }, 
  input_regisCapital(e) {
    this.setData({
      regisCapital: e.detail.value
    })
  },
  input_busnissTerm(e) {
    this.setData({
      busnissTerm: e.detail.value
    })
  },
  input_phoneNamber(e) {
    this.setData({
      phoneNamber: e.detail.value
    })
  },
})