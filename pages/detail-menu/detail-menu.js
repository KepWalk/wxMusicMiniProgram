// pages/detail-menu/detail-menu.js
import { get } from "underscore"
import { getSongMenuTag, getSongMenuList } from "../../services/music"

Page({
    data: {
        songMenus: []
    },

    onLoad() {
        this.fetchAllMenuList();
    },

    async fetchAllMenuList() {
        const tagRes = await getSongMenuTag();
        const tags = tagRes.tags;

        // 根据tag获取对应的歌单
        // 注意这里不要每次拿到新的数据就放入songMenus中，影响性能
        // 合理的做法是将所有返回的promise存到一个Array中，通过promise.all判断是否所有的数据都收到，最后一起放入songMenus
        const allPromises = [];
        for(const tag of tags) {
            const promise = getSongMenuList(tag.name);
            allPromises.push(promise);
        }

        // 将数据放入songMenus
        Promise.all(allPromises).then(res => {
            this.setData({songMenus: res})
        })
    }
})