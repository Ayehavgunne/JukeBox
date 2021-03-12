let play_btn_show_play_icon = () => {
    play_button.checked = false
}
let play_btn_show_pause_icon = () => {
    play_button.checked = true
}

let play_button = document.getElementById('playpause')
let progress_dot = document.getElementById('progress_dot')
let tracks_div = document.getElementById('tracks')
let audio = new Audio()
let progress_updater
let track_data
let album_data
let artist_data
let triggered_almost_done_event = false
play_btn_show_pause_icon()

const track_finished_event = new Event('track_finished')
const track_almost_finished_event = new Event('track_almost_finished')
window.addEventListener('track_finished', () => {
    triggered_almost_done_event = false
    stop_progress_monitor()
    progress_dot.style.left = '0'
    play_btn_show_play_icon()
    console.log('track_done')
})
window.addEventListener('track_almost_finished', () => {
    triggered_almost_done_event = true
    console.log('track_almost_done')
})
audio.addEventListener('pause', () => {
    play_btn_show_pause_icon()
    stop_progress_monitor()
    console.log('paused')
})
audio.addEventListener('play', () => {
    if (audio.src) {
        play_btn_show_play_icon()
        start_progress_monitor()
    }
    else {
        play_btn_show_pause_icon()
    }
    console.log('playing')
})

fetch('/tracks').then(response => {
    return response.json()
}).then(response => {
    track_data = response
    let track_html = ''
    for (let track of response) {
        track_html += '<div class="track" data-track_id="' + track.track_id + '">Artist: ' + track.artist + ' - Album: ' + track.album + ' - Title: ' + track.title + '</div>'
    }
    tracks_div.innerHTML = track_html
    let track_divs = document.getElementsByClassName('track')
    for (let track_div of track_divs) {
        track_div.addEventListener('click', event => {
            audio.src = '/play/' + event.target.getAttribute('data-track_id')
            play()
        })
    }
})
fetch('/albums').then(response => {
    return response.json()
}).then(response => {
    album_data = response
})
fetch('/artists').then(response => {
    return response.json()
}).then(response => {
    artist_data = response
})

play_button.addEventListener('click', () => {
    if (audio.paused) {
        play()
    }
    else {
        pause()
    }
})

let update_progress = () => {
    let duration = audio.duration
    let current_time = audio.currentTime
    let position = ((current_time / duration) * 100)
    progress_dot.style.left = position.toFixed(2) + '%'
    if (position >= 100) {
        window.dispatchEvent(track_finished_event)
    }
    if (!triggered_almost_done_event && position > 90) {
        window.dispatchEvent(track_almost_finished_event)
    }
}
let start_progress_monitor = () => {
    triggered_almost_done_event = false
    progress_updater = setInterval(update_progress, 50)
}
let stop_progress_monitor = () => {
    clearInterval(progress_updater)
}

let play = () => {
    let playPromise = audio.play()
    if (playPromise !== undefined) {
        playPromise.catch(function(error) {
            // Automatic playback failed.
            // Show a UI element to let the user manually start playback.
        });
    }
}
let pause = () => {
    audio.pause()
}
// let stop = () => {
//     audio.pause()
//     audio.fastSeek(0)
//     play_btn_show_pause_icon()
//     stop_progress_monitor()
//     progress_dot.style.left = '0'
// }
