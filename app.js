//app.js
App({
  onLaunch: function() {

    // 测试
    // this.url = 'https://tinvoiceworder.weein.cn';
    // this.load_url = 'https://tinvoiceworder.weein.cn/v1/customermanager';
    // this.reqUrlVersion = 'dev';

    // 线上江西电信的 yg注释
    // this.url = 'https://invoiceworder-ct.weein.cn';
    // this.load_url = 'https://invoiceworder-ct.weein.cn/v1/customermanager';
    // this.reqUrlVersion = 'online';

    //线上联通整个的
    this.url = 'https://invoiceworder.weein.cn';
    this.load_url = 'https://invoiceworder.weein.cn/v1/customermanager';
    this.reqUrlVersion= 'online';

  },
  globalData: {
    userInfo: null
  }
})