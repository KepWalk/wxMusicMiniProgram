// 对歌词进行解析
const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/

export function parseLyric(lrcString) {
    const lyricInfos = [];
    const lyricLines = lrcString.split("\n");
    for(const lineSring of lyricLines) {
        const results = timeReg.exec(lineSring);
        if (!results) continue;
        // 获取时间
        // String * Number = Number
        const minute = results[1] * 60 * 1000;
        const second = results[2] * 1000;
        const mSecond = results[3].length === 2 ? results[3] * 10 : results[3] * 1;
        const time = minute + second + mSecond;
        // 获取文本
        const text = lineSring.replace(timeReg, "");
        // 后端给的数据有可能是空的
        if(text === "") continue;

        // 时间起点、文本、滚动距离
        lyricInfos.push({time, text, scrollTop: 0});
    }

    return lyricInfos;
}