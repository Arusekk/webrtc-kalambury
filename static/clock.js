function startCountdown(clock) {
  var endTime = new Date().getTime();
  endTime += (1000 * 60 * 2);

  var x = setInterval(function() {

    var timeNow = new Date().getTime();
    var timeLeft = endTime - timeNow;

    var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    var miliseconds = Math.floor((timeLeft % 1000))

    if (timeLeft <= 0) {
      clearInterval(x);
      minutes = seconds = miliseconds = 0;
    }

    clock.textContent = minutes + "::" + seconds + "::" + miliseconds;
  }, 1);
}
