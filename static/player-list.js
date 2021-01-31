function setupPlayerList() {
  signaler.on('players', players => {
    const newList = document.createElement('ul');

    players.forEach(([name, data]) => {
      const elem = document.createElement('li');
      elem.className = data.present ? 'present' : 'absent';
      elem.textContent = `${name} (${data.score})`;
      newList.appendChild(elem);
    });

    playerList.replaceWith(newList);
    newList.id = 'playerList';
  });
}
