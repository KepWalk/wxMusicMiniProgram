// 注：globalData全局数据共享无法做到响应式，只能存储一些简单的数据
import { HYEventStore } from "hy-event-store"
import { getPlayListDetail } from "../services/music"

const recommendStore = new HYEventStore({
    state: {
        // 推荐歌曲
        recommendSongsInfo: {}
    },
    actions: {
        fetchRecommendSongsAction(context) {
            getPlayListDetail(3778678).then(res => {
                context.recommendSongsInfo = res.playlist;
            })
        }
    }
})

export default recommendStore