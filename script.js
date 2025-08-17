// Elemanlar
const startBtn       = document.getElementById("start-btn");
const replayBtn      = document.getElementById("replay-btn");
const startScreen    = document.getElementById("start-screen");
const gameScreen     = document.getElementById("game-screen");
const congratsScreen = document.getElementById("congrats-screen");
const puzzleContainer= document.getElementById("puzzle-container");
const bgMusic        = document.getElementById("bg-music");
const video          = document.getElementById("video");

const COLS = 6, ROWS = 4;

let correctOrder = [];   // [0..23]
let pieces = [];         // DOM parçaları
let dragged = null;      // sürüklenen
let tapSelected = null;  // mobil "dokun-seç" modu

// Başlat
startBtn.addEventListener("click", async () => {
  show(gameScreen); hide(startScreen); hide(congratsScreen);
  try { await bgMusic.play(); } catch (_) {/* kullanıcı etkileşimi yoksa engellenebilir */}
  initPuzzle();
});

// Tekrar Oyna
replayBtn.addEventListener("click", () => {
  try { video.pause(); video.currentTime = 0; } catch(_){}
  show(gameScreen); hide(startScreen); hide(congratsScreen);
  initPuzzle();
  try { bgMusic.currentTime = 0; bgMusic.play(); } catch(_) {}
});

// Puzzle Kurulumu
function initPuzzle(){
  puzzleContainer.innerHTML = "";
  pieces = [];
  correctOrder = [];

  for(let y=0; y<ROWS; y++){
    for(let x=0; x<COLS; x++){
      const index = y*COLS + x;
      correctOrder.push(index);

      const piece = document.createElement("div");
      piece.className = "piece";
      piece.setAttribute("data-index", String(index));
      // doğru parçayı gösterecek şekilde arka plan konumu
      piece.style.backgroundPosition = `${(x/(COLS-1))*100}% ${(y/(ROWS-1))*100}%`;
      piece.draggable = true;

      // Masaüstü: sürükle-bırak
      piece.addEventListener("dragstart", () => dragged = piece);
      piece.addEventListener("dragover", ev => ev.preventDefault());
      piece.addEventListener("drop", () => {
        if(!dragged || dragged===piece) return;
        swapElements(dragged, piece);
        dragged = null;
        checkWin();
      });

      // Mobil/masaüstü: dokun-tıkla ile seç & takas
      piece.addEventListener("click", () => handleTapSwap(piece));

      pieces.push(piece);
    }
  }

  // Karıştır ve yerleştir
  shuffleArray(pieces);
  pieces.forEach(p => puzzleContainer.appendChild(p));
}

// Tap-to-swap (mobil dostu)
function handleTapSwap(piece){
  if(!tapSelected){
    tapSelected = piece;
    piece.classList.add("selected");
    return;
  }
  if(tapSelected === piece){
    piece.classList.remove("selected");
    tapSelected = null;
    return;
  }
  swapElements(tapSelected, piece);
  tapSelected.classList.remove("selected");
  tapSelected = null;
  checkWin();
}

// DOM'da iki elemanı yer değiştir
function swapElements(a, b){
  const ph = document.createElement("div");
  puzzleContainer.replaceChild(ph, a);
  puzzleContainer.replaceChild(a, b);
  puzzleContainer.replaceChild(b, ph);
}

// Karıştır
function shuffleArray(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Kazanma kontrolü
function checkWin(){
  const orderNow = Array.from(puzzleContainer.children)
    .map(p => p.getAttribute("data-index"));
  if( JSON.stringify(orderNow) === JSON.stringify(correctOrder.map(String)) ){
    winGame();
  }
}

// Kazanıldığında
function winGame(){
  hide(gameScreen);
  show(congratsScreen);

  // ❤️ Kalpli konfeti
  try {
    const burst = () => confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.3 + Math.random()*0.2, x: Math.random()*0.6 + 0.2 },
      emojis: ["❤️","💖","💕","💘"],
      scalar: 1.6
    });
    burst(); setTimeout(burst, 250); setTimeout(burst, 500);
  } catch(_) {}

  // 🎵 MÜZİĞİ DURDUR
  try { bgMusic.pause(); bgMusic.currentTime = 0; } catch(_){}

  // 🎬 Videoyu oynat
  video.src = "video.mp4"; // güvene al
  const playAttempt = video.play();
  if (playAttempt && typeof playAttempt.then === "function") {
    playAttempt.catch(() => { video.controls = true; });
  }
}

// Görünürlük yardımcıları
function show(el){ el.style.display = "block"; }
function hide(el){ el.style.display = "none"; }