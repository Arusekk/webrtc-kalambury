function randomWord () {
  signaler.on('randomWord', word => {
    guessWord.textContent = word;
    guessWord.parentElement.style.visibility = 'visible';
  });
}
