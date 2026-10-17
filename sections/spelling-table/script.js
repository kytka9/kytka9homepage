"use strict";
const tables = {
  sk: [
    ["A", "Adam"],
    ["B", "Božena"],
    ["C", "Cyril"],
    ["Č", "Čadca"],
    ["D", "Dávid"],
    ["Ď", "Ďumbier"],
    ["E", "Emil"],
    ["F", "František"],
    ["G", "Gustáv"],
    ["H", "Helena"],
    ["CH", "Chopok"],
    ["I", "Ivan"],
    ["J", "Jozef"],
    ["K", "Karol"],
    ["L", "Ladislav"],
    ["Ľ", "Ľubochňa"],
    ["M", "Mária"],
    ["N", "Norbert"],
    ["Ň", "Nitra"],
    ["O", "Oto"],
    ["P", "Peter"],
    ["Q", "Quido"],
    ["R", "Rudolf"],
    ["S", "Svätopluk"],
    ["Š", "Šimon"],
    ["T", "Tomáš"],
    ["Ť", "Teplá"],
    ["U", "Urban"],
    ["V", "Václav"],
    ["W", "dvojité vé"],
    ["X", "Xaver"],
    ["Y", "Ypsilon"],
    ["Z", "Zuzana"],
    ["Ž", "Žofia"]
  ],
  international: [
    ["A", "Alfa"],
    ["B", "Bravo"],
    ["C", "Charlie"],
    ["D", "Delta"],
    ["E", "Echo"],
    ["F", "Foxtrot"],
    ["G", "Golf"],
    ["H", "Hotel"],
    ["I", "India"],
    ["J", "Juliett"],
    ["K", "Kilo"],
    ["L", "Lima"],
    ["M", "Mike"],
    ["N", "November"],
    ["O", "Oscar"],
    ["P", "Papa"],
    ["Q", "Quebec"],
    ["R", "Romeo"],
    ["S", "Sierra"],
    ["T", "Tango"],
    ["U", "Uniform"],
    ["V", "Victor"],
    ["W", "Whiskey"],
    ["X", "X-ray"],
    ["Y", "Yankee"],
    ["Z", "Zulu"]
  ]
};
const $ = id => document.getElementById(id);
let deck = [];
let index = 0;
let revealed = false;
let finished = false;
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
function buildDeck() {
  const selectedSystem = $("system").value;
  deck = tables[selectedSystem].map(item => [...item]);
  if ($("shuffle").checked) {
    shuffleArray(deck);
  }
  index = 0;
  revealed = false;
  finished = false;
  showCurrent();
}
function showCurrent() {
  if (index >= deck.length) {
    finishRound();
    return;
  }
  revealed = false;
  const [letter, answer] = deck[index];
  $("letter").textContent = letter;
  $("answer").textContent = answer;
  $("answer").classList.add("hidden");
  $("letterLabel").textContent = "Tvoje písmeno";
  $("hint").textContent = "Aké je jeho hláskovacie heslo?";
  $("reveal").disabled = false;
  $("reveal").textContent = "Ukázať heslo";
  $("next").disabled = false;
  $("next").textContent = "Ďalšie písmeno →";
  $("counter").textContent =
    `Písmeno ${index + 1} z ${deck.length}`;
  $("remaining").textContent =
    `Zostáva ${deck.length - index}`;
  updateProgress(index / deck.length * 100);
}
function updateProgress(percent) {
  const value = Math.round(percent);
  $("progressBar").style.width = `${value}%`;
  $("progress").setAttribute("aria-valuenow", value);
}
function revealAnswer() {
  if (revealed || finished) return;
  revealed = true;
  $("answer").classList.remove("hidden");
  $("hint").textContent = "Správne hláskovacie heslo:";
  $("reveal").textContent = "✓ Heslo zobrazené";
  $("reveal").disabled = true;
}
function nextLetter() {
  if (finished) {
    if ($("repeat").checked) {
      buildDeck();
    }
    return;
  }
  index++;
  showCurrent();
}
function finishRound() {
  finished = true;
  $("letter").textContent = "✓";
  $("letterLabel").textContent = "Hotovo!";
  $("answer").classList.add("hidden");
  $("hint").textContent = $("repeat").checked
    ? "Výborne! Celé kolo máš za sebou."
    : "Kolo je dokončené. Môžeš začať znova.";
  $("counter").textContent = "Kolo dokončené";
  $("remaining").textContent = "Zostáva 0";
  updateProgress(100);
  $("reveal").disabled = true;
  $("reveal").textContent = "✓ Kolo dokončené";
  if ($("repeat").checked) {
    $("next").disabled = false;
    $("next").textContent = "↻ Ďalšie kolo";
  } else {
    $("next").disabled = true;
    $("next").textContent = "Kolo dokončené";
  }
}
$("reveal").addEventListener("click", revealAnswer);
$("next").addEventListener("click", nextLetter);
$("restart").addEventListener("click", buildDeck);
$("system").addEventListener("change", buildDeck);
$("shuffle").addEventListener("change", buildDeck);
$("repeat").addEventListener("change", () => {
  if (finished) {
    finishRound();
  }
});
$("fullscreen").addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch {
    alert(
      "Celú obrazovku skús zapnúť cez ponuku prehliadača."
    );
  }
});
document.addEventListener("keydown", event => {
  if (event.code === "Space") {
    if (
      event.target instanceof HTMLButtonElement ||
      event.target instanceof HTMLSelectElement ||
      event.target instanceof HTMLInputElement
    ) {
      return;
    }
    event.preventDefault();
    if (!revealed && !finished) {
      revealAnswer();
    } else {
      nextLetter();
    }
  }
  if (event.key === "ArrowRight") {
    nextLetter();
  }
});
buildDeck();