// components/song-item-v1/song-item-v1.js
Component({
    properties: {
        itemData: {
            type: Object,
            value: {}
        }
    },
    methods: {
        onSongItemTap() {
            wx.navigateTo({
              url: `/packagePlayer/pages/music-player/music-player?id=${this.properties.itemData.id}`,
            })
        }
    }
})