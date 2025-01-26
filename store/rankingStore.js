import { HYEventStore } from "hy-event-store"
import { getPlayListDetail } from "../services/music"

// const rankingIds = [3779629, 2884035, 19723756]
const rankingMap = {
    newRanking: 3779629,
    originRanking: 2884035,
    upRanking: 19723756
}
const rankingStore = new HYEventStore({
    state: {
        newRanking: {},
        originRanking: {},
        upRanking: {}
    },
    actions: {
        fetchRankingDataAction(context) {
            for(const key in rankingMap) {
                const id = rankingMap[key];
                getPlayListDetail(id).then(res => {
                    context[key] = res.playlist
                })
            }
        }
    }
})

export default rankingStore;