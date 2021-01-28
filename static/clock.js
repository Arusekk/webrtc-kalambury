const duration = 1000 * 60 * 2;

function startCountdown(endTime) {
  if (!endTime) {
    endTime = Date.now() + duration;
    signaler.emit('clock', endTime);
  }

  clock_button.disabled = true;
  const r = document.querySelector(':root');
  const x = setInterval(() => {
    const timeLeft = endTime - Date.now();

    let milliseconds = timeLeft % 1000;
    let seconds = Math.floor(timeLeft / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;

    const progress = timeLeft / duration;

    if (timeLeft <= 0) {
      clearInterval(x);
      minutes = seconds = milliseconds = 0;
      signaler.emit('clock end');
      stopCountdown ();
    }

    r.style.setProperty('--clock-fill', `${Math.floor(360 * progress)}deg`);

    var time = `${minutes}:${seconds.toString().padStart(2,0)}:${milliseconds.toString().padStart(3,0)}`;
    clock.textContent = time;
  }, 47);
}

function stopCountdown () {
  clock.textContent = "Timer";
  clock_button.disabled = false;
}

function setupClock() {
  signaler.on('clock', endTime => startCountdown(endTime))
}
