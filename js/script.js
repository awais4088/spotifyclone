console.log("hello from controller");

var currentsong = new Audio();
let songs;
let currFolder;

function secondsToMinutesAndSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  // Calculate minutes and seconds
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = Math.floor(seconds % 60);

  // Convert minutes and seconds to strings with leading zeros if necessary
  var minutesString = String(minutes).padStart(2, "0");
  var secondsString = String(remainingSeconds).padStart(2, "0");

  // Return the result in "minutes:seconds" format
  return minutesString + ":" + secondsString;
}

// Example usage:
// console.log(secondsToMinutesAndSeconds(72)); // Output: "01:12"

async function getsongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  let songUL = document
    .querySelector(".songs-list")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
        <img class="invert" src="images/music.svg" alt="">
        <div class="info">
                    <div> ${song.replaceAll("%20", "")}</div>
                    </div>
                  <div class="palynow">
                    <span>Play Now</span>
                    <img class="invert" src="images/playbutton.svg" alt="">
                  </div>
         </li>`;
  }

  // Event listner to play song when clicked

  Array.from(
    document.querySelector(".songs-list").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
}

const playMusic = (track, pause = false) => {
  currentsong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "images/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/song/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".card-container");
  let array = Array.from(anchors);
  // console.log(e.href);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/song/")) {
      let folder = e.href.split("/").slice(-1)[0];
      //geting metadata of the folder
      let a = await fetch(`http://127.0.0.1:5500/song/${folder}/info.json`);
      let response = await a.json();
      console.log(response);

      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
            <div class="play">
              <img src="images/play.svg" alt="" />
            </div>
            <img
              src="/song/${folder}/cover.jpg"
              alt=""
            />
            <h3>${response.title}</h3>
            <p>${response.description}</p>
          </div>`;
    }
    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
      e.addEventListener("click", async (item) => {
        songs = await getsongs(`song/${item.currentTarget.dataset.folder}`);
      });
    });
  }
}

async function main() {
  await getsongs("song/ncs");
  // console.log(songs)
  playMusic(songs[0], true);

  // Display all the albums on the page
  displayAlbums();

  // Event listner for play,next and previous songs
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "images/pause.svg";
    } else {
      currentsong.pause();
      play.src = "images/playbutton.svg";
    }
  });

  //Adding listner for time update event
  currentsong.addEventListener("timeupdate", () => {
    // console.log(currentsong.currentTime,currentsong.duration);
    document.querySelector(
      ".songtime"
    ).innerHTML = `${secondsToMinutesAndSeconds(
      currentsong.currentTime
    )}/${secondsToMinutesAndSeconds(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  //Adding an event listner to the seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  // Event listner for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Event listner for hidden-cross
  document.querySelector(".hiddencross").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  // Event listner for previous and next buttons
  previous.addEventListener("click", () => {
    console.log("previous clicked");
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);

    if (index > 0) {
      playMusic(songs[index - 1]);
    } else {
      // Optionally, you can handle what to do when you're at the first song
      alert("You are already at the beginning of the playlist.");
    }
  });

  next.addEventListener("click", () => {
    console.log("next clicked");
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);

    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      // Optionally, you can handle what to do when you're at the first song
      alert("You are already at the ending of the playlist.");
    }
  });
  // Adding event to increase and decrease volume
  let changevolume = document.querySelector(".range input[type='range']");
  changevolume.addEventListener("change", (e) => {
    //  console.log(e,e.target);

    currentsong.volume = parseInt(e.target.value) / 100;
  });
  // console.log(currFolder);
}

main();
