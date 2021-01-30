function setupPlayerList() {
  signaler.on('players', players => {
    const newList = document.createElement('ul');

    players.forEach(([name, data]) => {
      const elem = document.createElement('button');
      elem.textContent = `${name} (${data.score})`;
      elem.onclick = function () {
        onclick_func(name);
      };
      newList.appendChild(elem);
    });

    playerList.replaceWith(newList);
    newList.id = 'playerList';
  });
}


function onclick_func(name) {
  console.log(name);
  signaler.emit('add_point', name);
}
