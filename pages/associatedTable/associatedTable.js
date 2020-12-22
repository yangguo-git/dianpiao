var app = getApp();
var that,getBizlicenseByUpload_setTimeout_time;
const util = require('../../utils/util.js');
var common = require('../common.js');

// 24.上传商户税盘照片接口 税盘正反面照片接口
var uploadImage = app.load_url + '/uploadImage.do';

// 25.上传商户已开发票ocr接口    // 返回 taskId
var uploadInvoiceImage = app.load_url + '/uploadInvoiceImage.do';

// 26.获取ocr发票信息接口
var getInvoiceImageContentByUpload = '/v1/customermanager/getInvoiceImageContentByUpload.do';
// session	String	否	
// mid	String		任务id（taskId）
Page({

  data: {
    showCover:false,
    orderId:'',
    tableCardCode: '',
    taskId:'8735e1bc4957442faacbadccac82d699',
    inputValue:'',
    chooseType:'',
    phone:'',
    taxBoxBackUrl:'',
    invoiceUrl:'',
    taxBoxFrontUrl:'',
    taxBoxId:'',
    corpName:'',
    contactPhone:'',
    corpId:'',
    corpAddress:'',
    corpPhone:'',
    corpBank:'',
    corpBankAccount:'',
    issuier:'',
    cashier:'',
    checker:'',
    itemName:'',
    itemTaxRate:'',
    itemCode:'',
  },

  onLoad: function (options) {

    console.log("onLoad",options)
    that=this;
    if(options.orderId){
     this.setData({
      orderId:options.orderId
     }) 
    }
    //上一步选择的类型
    if(options.chooseType){
      this.setData({
        chooseType:options.chooseType
       }) 
    }

    common.init.apply(this, []); //公共登录
    if(options.tableCardCode){
      this.setData({
        tableCardCode: options.tableCardCode
      })

    }

  },
  phoneInput(e){
    console.log(e.detail.value);
    this.setData({
      phone:e.detail.value
    })
  },
  postGetInvoiceImageContentByUpload(taskId){//获取ocr发票信息接口
    var data={
      session: wx.getStorageSync('session'),
      mid:taskId //获取图片识别结果的标识ID
    }
    util.request(getInvoiceImageContentByUpload, 'post', data, '', (res) => {
      if (res.data.success) {
        // if(res.data.module.cashier){
          that.setData({
            cashier:res.data.module.cashier,
            checker:res.data.module.checker,
            corpId:res.data.module.corpId,
            corpName:res.data.module.corpName,
            issuier:res.data.module.issuier,
            itemTaxRate:res.data.module.itemTaxRate,
          })
        // }
      } else {
        if (res.data.errorCode == '30023') {
          that.showToast_fail(res.data.errorMsg)
        } else {
          if (new Date().getTime() < getBizlicenseByUpload_setTimeout_time + 1000 * 15) {
            setTimeout(() => {
              that.postGetInvoiceImageContentByUpload(taskId);
            }, 1000)
          } else {
            wx.hideLoading();
            that.showToast_fail('未识别成功，请重新识别')
          }
        }
      }
    }, (err) => {
      that.showToast_fail('网络错误');
    })
  },
  hideCover:function(){//点击弹窗按钮
    this.setData({
      showCover:false
     }) 
    // 提交到后端
    if(this.data.orderId){

      common.init.apply(this, []); //公共登录   
      this.pro_getSession.then(resolve => {
          this.checkOrderIsDoneByUser();
      })
    }
    
  },
  checkOrderIsDoneByUser: function () {//检查

    let url = '/v1/customermanager/validateOrderIsTrue.do';
    let data = {
      orderId: this.data.orderId,
      session: wx.getStorageSync('session'),
      // type:this.data.name=='拓展版'?1:2  chooseType
      type:this.data.chooseType

    }
    util.request(url, 'post', data, '', (res) => {
      if (res.data.success) {
        console.log("检查成功",res)
        debugger
        let getinvoiceUrl = this.data.invoiceUrl;
        let gettaxBoxFrontUrl = this.data.taxBoxFrontUrl;
        let gettaxBoxBackUrl = this.data.taxBoxBackUrl;

        if(getinvoiceUrl && gettaxBoxFrontUrl && gettaxBoxBackUrl){
           
          this.postAddMchInfoExtendForManager();//最终提交关联
         
        }
        
      } else {
        wx.showToast({
          title: res.data.errorMsg,
          icon: 'none'
        })
        return;
      }
    })

  },
  guanlianEvent(){//点击关联桌牌
    if(this.data.orderId == ""){
      this.setData({
        showCover:true
       }) 
       return;
    }
    this.checkOrderIsDoneByUser();


  },
  changeCancelReason: function (e) {//弹窗中输入框输入事件
    this.setData({
      orderId: e.detail.value,
      inputValue:e.detail.value
    })
  },
  name_input:function(e){//页面输入事件
    this.setData({
      orderId: e.detail.value,
      inputValue:e.detail.value
    })
  },
  upimg: function (e) {
    //上传前判断是否输入沃云号
    if(this.data.orderId == ""){
      this.setData({
        showCover:true
       }) 
       return;
    }
    var idx =e.currentTarget.dataset.type;
    var url;
    if(idx =='1'){
      url=uploadInvoiceImage
    }else{
      url=uploadImage
    }
    wx.chooseImage({
      success: function (res) {
        wx.showLoading({
          title: '上传中···',
        })
        var data = {
          session: wx.getStorageSync('session')
        }
        var tempFilePaths = res.tempFilePaths  //图片
        wx.uploadFile({
          url: url, //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file', //文件对应的参数名字(key)
          formData: data,  //其它的表单信息
          success: function (res) {
            res =JSON.parse(res.data);
            console.log('res',res)
            if(res.success){

              if(res.module.taskId){

                var taskId = res.module.taskId;

                getBizlicenseByUpload_setTimeout_time = new Date().getTime()
                that.postGetInvoiceImageContentByUpload(taskId)
                that.setData({
                  taskId,
                })
              }
              if(idx==1){//增值税发票照片
  
                that.setData({
                  invoiceUrl:res.module.imageUrl
                })
              }else if(idx==2){//税控盘正面照片
                that.setData({
                  taxBoxFrontUrl:res.module.imageUrl
                })
              }else if(idx==3){//税控盘反面照片
                that.setData({
                  taxBoxBackUrl:res.module.imageUrl
                })
              }
            }else{
              wx.showToast({
                title: '识别失败',
              })
            }
          },complete:function(common){
            wx.hideLoading({
              complete: (res) => {},
            })
          }
        })
      }
    })
  },
 
  postAddMchInfoExtendForManager(){ // 27.客户经理提交商户电子发票信息接口
    var url ='/v1/customermanager/addMchInfoExtendForManager.do';
    // session	String	否	
    // tableCard	String	否	桌牌ID
    // orderId	String	否	腾讯云订单ID
    // invoiceUrl	String	否	已开发票照片
    // taxBoxFrontUrl	String	否	税盘正面照片
    // taxBoxBackUrl	String	否	税盘反面照片
    // taxBoxId	String	是	税盘编号
    // taxType	String	是	税盘类型
    // taxDiskKey	String	是	税盘口令
    // taxDiskPassword	String	是	税盘证书密码
    // corpName	String	否	纳税人名称名称
    // contactPhone	String	否	商户联系手机号
    // corpId	String	是	纳税人识别号
    // corpAddress	String	是	注册地址
    // corpPhone	String	是	注册电话
    // corpBank	String	是	开户银行
    // corpBankAccount	String	是	开户账号
    // issuier	String	是	开票人
    // cashier	String	是	收款人
    // checker	String	是	复核人
    // itemName	String	是	开票项目名称
    // itemTaxRate	String	是	开票税率
    // itemCode	String	是	开票商品编码
    var data={
      session:wx.getStorageSync('session'),
    }
    if(this.data.phone){
      data.contactPhone =this.data.phone;
    }
    if(this.data.tableCardCode){
      data.tableCard =this.data.tableCardCode;
    }
    if(this.data.orderId){
      data.orderId =this.data.orderId;
    }
    if(this.data.invoiceUrl){
      data.invoiceUrl =this.data.invoiceUrl;
    }
    if(this.data.taxBoxFrontUrl){
      data.taxBoxFrontUrl =this.data.taxBoxFrontUrl;
    }
    if(this.data.taxBoxBackUrl){
      data.taxBoxBackUrl =this.data.taxBoxBackUrl;
    }
    if(this.data.taxBoxId){
      data.taxBoxId =this.data.taxBoxId;
    }
    if(this.data.corpName){
      data.corpName =this.data.corpName;
    }else{
      wx.showToast({
        title: '请重新识别发票照片',
        icon:'none'
      })
      return
    }
    if(this.data.corpId){
      data.corpId =this.data.corpId;
    }
    if(this.data.corpAddress){
      data.corpAddress =this.data.corpAddress;
    }
    if(this.data.corpPhone){
      data.corpPhone =this.data.corpPhone;
    }
    if(this.data.corpBank){
      data.corpBank =this.data.corpBank;
    }
    if(this.data.corpBankAccount){
      data.corpBankAccount =this.data.corpBankAccount;
    }
    if(this.data.issuier){
      data.issuier =this.data.issuier;
    }
    if(this.data.cashier){
      data.cashier =this.data.cashier;
    }
    if(this.data.itemName){
      data.itemName =this.data.itemName;
    }
    if(this.data.itemTaxRate){
      data.itemTaxRate =this.data.itemTaxRate;
    }
    if(this.data.itemCode){
      data.itemCode =this.data.itemCode;
    }
    console.log("提交关联参数",data)
    util.request(url, 'post', data, '', (res) => {
      if (res.data.success) {
        wx.navigateTo({
          // url: '/pages/submit_succ/submit_succ?id='+res.data.module.id,thirdStep
           url: '/pages/thirdStep/thirdStep?id='+res.data.module.id,
        })

      } else {
        that.showToast_fail(res.data.errorMsg);
      }
    }, (err) => {
      that.showToast_fail('网络错误');
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