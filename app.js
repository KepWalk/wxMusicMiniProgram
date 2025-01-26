// app.js
App({
    globalData: {
        screenWidth: 390,
        screenHeight: 844,
        statusHeight: 47,
        contentHeight: 671,
    },

    onLaunch() {
        const windowInfo = wx.getWindowInfo();
        this.globalData.screenWidth = windowInfo.screenWidth;
        this.globalData.screenHeight = windowInfo.screenHeight;
        this.globalData.statusHeight = windowInfo.statusBarHeight;
        // 如果使用默认的导航栏contentHeight = windowHeight = screenHeight - 导航栏高度
        // 自定义导航栏就不能使用windowHeight了
        this.globalData.contentHeight = windowInfo.screenHeight - windowInfo.statusBarHeight - 44;
    }
})
