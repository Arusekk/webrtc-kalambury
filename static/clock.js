const duration = 1000 * 60 * 2;

function startCountdown(deadline) {
  if (!deadline) {
    deadline = Date.now() + duration;
    signaler.emit('clock', { deadline, now: Date.now() });
  }

  clockButton.disabled = true;
  const r = document.querySelector(':root');
  const x = setInterval(() => {
    const timeLeft = deadline - Date.now();

    let milliseconds = timeLeft % 1000;
    let seconds = Math.floor(timeLeft / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;

    let progress = timeLeft / duration;

    if (timeLeft <= 0) {
      clearInterval(x);
      progress = minutes = seconds = milliseconds = 0;
      signaler.emit('clock end');
      stopCountdown();
    } else {
      const time = `${minutes}:${seconds.toString().padStart(2,0)}:${milliseconds.toString().padStart(3,0)}`;
      clock.textContent = time;
    }

    r.style.setProperty('--clock-fill', `${Math.floor(360 * progress)}deg`);
  }, 47);
}

function stopCountdown () {
  clock.textContent = "Timer";
  clockButton.disabled = false;
}

function setupClock() {
  signaler.on('clock', ({ deadline, now }) => startCountdown(deadline + Date.now() - now))
}

// vim: set et ts=2 sw=2: kate: replace-tabs on; indent-width 2; tab-width 2;
