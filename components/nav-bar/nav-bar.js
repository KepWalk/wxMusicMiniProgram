// components/nav-bar/nav-bar.js
const app = getApp();

Component({
    options: {
        // 多插槽还要自己设置
        multipleSlots: true
    },

    properties: {
        title: {
            type: String,
            value: "默认标题"
        }
    },

    data: {
        statusHeight: 0
    },

    lifetimes: {
        // 官方文档不建议在created中完成初始化工作，created不能调用this.setData操作
        attached() {
            this.setData({statusHeight: app.globalData.statusHeight})
        }
    },
    methods: {
        onLeftTap() {
            this.triggerEvent("lefttap");
        }
    }
})