function randomWord () {
  signaler.on('random word', word => {
    guessWord.textContent = word;
    guessWord.parentElement.style.visibility = 'visible';
  });
}
