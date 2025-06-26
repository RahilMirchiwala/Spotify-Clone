
let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    // Calculate the minutes and seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format the values to ensure two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Return the result in "mm:ss" format
    return `${formattedMinutes}:${formattedSeconds}`;
}


// async function return promish
async function getSongs(folder) {
    currFolder = folder;
    // Fatch the song
    // fetch returns a Promise that represents the network request
    let a = await fetch(`http://127.0.0.1:3000/Project/Spotify/Songs/${folder}/`)
    // await is used to pause the execution until the fetch Promise resolves.
    // The await keyword can only be used inside async functions or top-level code in environments that support top-level await.
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            //[1] use for /Songs/ ke bad jo hoga vo print ho jayga
            songs.push(element.href.split(`/Project/Spotify/Songs/${folder}/`)[1])
        }
    }
    //Show all the songs in playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = " "
    // forof loop use for arrray
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="img/music.svg" alt="" srcset="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Rahil Mirchiwala</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="" srcset="">
                            </div></li>`;
    }

    //Rougf Work
    // //Play the first song
    // var audio = new Audio(songs[4]);
    // audio.play();

    //     audio.addEventListener("loadeddata", () => {
    //         // The duration variable now holds the duration(in seconds) of audio clip
    //         let duration = audio.duration;
    //         console.log(audio.duration, audio.currentSrc, audio.currentTime);
    //     })

    //Attech an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs

}

const playMusic = (treck, pause = false) => {
    // let audio=new Audio("/Project/Spotify/Songs/" +  treck)
    currentSong.src = `/Project/Spotify/Songs/${currFolder}/` + treck
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(treck)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/Project/Spotify/songs/`)
    // await is used to pause the execution until the fetch Promise resolves.
    // The await keyword can only be used inside async functions or top-level code in environments that support top-level await.
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    // console.log(div)
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[0]
            // console.log(e.href.split("/").slice(-2)[0])
            //get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/Project/Spotify/Songs/${folder}/info.json`)
            let response = await a.json()
            console.log(response)
            cardContainer.innerHTML = cardContainer
                .innerHTML +
                `<div data-folder=${folder} class="card"> <div class="play">
            <div
                style="display: inline-flex; justify-content: center; align-items: center; width: 50px; height: 50px; background-color: green; border-radius: 50%;">
                <svg width="24" height="24" viewBox="0 0 16 16" fill="black"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M4 3.993v8.014c0 .69.735 1.12 1.355.77l6.862-4.007a.89.89 0 0 0 0-1.54L5.355 3.23A.89.89 0 0 0 4 3.993z">
                    </path>
                </svg>
            </div>

        </div>
        <img src="/Project/Spotify/Songs/${folder}/cover.jpg" alt="">
        <h2>${response.tital}</h2>
        <p>${response.descripition}</p>
    </div>`
        }
    }

    //Load the playlist whanever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        // console.log(e)
        e.addEventListener("click", async item => {
            songs = await getSongs(`${item.currentTarget.dataset.folder}`)
            // console.log(songs)
            playMusic(songs[0])
        })
    })

}


async function main() {

    //Get the list of all the songs
    await getSongs("newSongs")
    playMusic(songs[0], true)
    // console.log(songs)

    // Display all the album on the page
    displayAlbums()

    // Attach an event list to paly,previous and next

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration)
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //Add an evennt listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        //The getBoundingClientRect() method is used for retrieving the size and position of an element relative to the viewport. 
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listener for hamburger

    document.querySelector(".hamburgar").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // Add an event listener for close

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        console.log("Previous Clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next Clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e, e.target, e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg")
        }

    })

    //Add event listener to mute volume
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
        }
    })


}

main()