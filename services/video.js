import {
    myRequest
} from "./index"

// 获取视频页面的相关数据
export function getTopMV(offset = 0, limit = 20) {
    return myRequest.get({
        url: "/top/mv",
        data: {
            limit,
            offset
        }
    })
}

// 获取每个id对应的视频
export function getMVUrl(id) {
    return myRequest.get({
        url: "/mv/url",
        data: {
            id
        }
    })
}

// 获取每个视频的信息
export function getMVInfo(mvid) {
    return myRequest.get({
        url: "/mv/detail",
        data: {
            mvid
        }
    })
}

// 获取每个视频的相关信息
export function getMVrelated(id) {
    return myRequest.get({
        url: "/related/playlist",
        data: {
            id
        }
    })
}