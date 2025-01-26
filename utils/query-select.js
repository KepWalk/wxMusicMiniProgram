export default function querySelect(selector, isAll = false) {
    // 这里封装一个Promise，外面就可以通过then方法拿到数据
    return new Promise(resolve => {
        // 获取Image组件的高度
        const query = wx.createSelectorQuery(); // 获取一个选择器查询
        if (!isAll) query.select(selector).boundingClientRect(); // 选取一个组件
        else query.selectAll(selector).boundingClientRect();
        // 获取组件的矩形框
        query.exec(res => {
            resolve(res);
        })
    })

}