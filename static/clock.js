function startCountdown(mode, beginning_time) {
  if (mode == 1) {
    beginning_time = new Date().getTime();
    signaler.emit('clock', beginning_time);
  }
  var endTime = beginning_time;
  endTime += (1000 * 60 * 2);


  clock_button.disabled = true;
  var x = setInterval(function() {

    var timeNow = new Date().getTime();
    var timeLeft = endTime - timeNow;

    var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    var miliseconds = Math.floor((timeLeft % 1000))

    if (timeLeft <= 0) {
      clearInterval(x);
      minutes = seconds = miliseconds = 0;
      signaler.emit('clock_end');
      stopCountdown ();
    }

    var time = minutes + "::" + seconds + "::" + miliseconds;
    clock.textContent = time;
  }, 1);
}

function stopCountdown () {
  clock.textContent = "Timer";
  clock_button.disabled = false;
}
