function randomWord () {

  signaler.on('randomWord', word => {
    console.log(word);
    alert(word);
  });
}
