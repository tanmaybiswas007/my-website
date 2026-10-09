/* Hero heading: "Good ___. Simple shopping."
   Only the middle word changes. It is typed and erased, going back and forth
   between "products" and "Experience". */
(function () {
  const WORDS = ["Products", "Experience"];
  const TYPE_MS = 80;    // delay between typed letters
  const DELETE_MS = 100;   // delay between erased letters
  const HOLD_MS = 450;   // pause while a word is fully shown
  const GAP_MS = 250;     // pause while the word is empty

  const target = document.getElementById("typewriter");
  if (!target) return;

  let wordIndex = 0;
  let text = WORDS[0];    // page starts showing "products"
  let deleting = false;

  function tick() {
    const word = WORDS[wordIndex];
    let delay;

    if (!deleting) {
      if (text.length < word.length) {
        text = word.slice(0, text.length + 1);
        delay = TYPE_MS;
      } else {
        deleting = true;      // fully typed: hold, then start erasing
        delay = HOLD_MS;
      }
    } else if (text.length > 0) {
      text = text.slice(0, -1);
      delay = DELETE_MS;
    } else {
      deleting = false;       // fully erased: switch to the other word
      wordIndex = (wordIndex + 1) % WORDS.length;
      delay = GAP_MS;
    }

    target.textContent = text;
    setTimeout(tick, delay);
  }

  setTimeout(tick, HOLD_MS);
})();

