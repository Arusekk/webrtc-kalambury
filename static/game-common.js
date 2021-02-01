let signaler

function getRTCPeerConnection(addr) {
  // might depend on signaler

  const pc = new RTCPeerConnection({
    iceServers: [{ urls: [
      'stun:stun.stunprotocol.org:3478',
    ] }],
  })

  // set up handshake handlers
  pc.onicecandidate = ({ candidate }) => signaler.emit('webrtc to', { candidate, addr })
  pc.onnegotiationneeded = async () => {
    console.log("negotiation needed")
    await pc.setLocalDescription()
    signaler.emit('webrtc to', { sdp: pc.localDescription, addr })
  }

  const onsdp = async sdp => {
    // tell us who they are
    await pc.setRemoteDescription(sdp)
    if (pc.signalingState !== 'stable') {
      // tell them who we are
      await pc.setLocalDescription()
      signaler.emit('webrtc to', { sdp: pc.localDescription, addr })
    }
  }
  return { pc, onsdp }
}

function setLocation(newLoc) {
  if (location.pathname.slice(1) + location.hash === newLoc) {
    console.log('need reload')
    location.reload()
  }
  else {
    console.log('want new location', newLoc)
    location.href = newLoc  // TODO: maybe history.pushState
  }
}

function setupGameIO(isDrawing) {
  signaler = io();

  setupChat(isDrawing);
  setupClock();
  setupPlayerList();

  signaler.on('new round', isNewOwner => {
    setLocation(`${isNewOwner ? 'draw' : 'view'}${location.hash}`)
  })
}

function restoreNickname(nick) {
  if (nick.value === nickname.textContent) return;

  signaler.emit('set nick', nick, response => {
    switch (response.result) {
      case 'ok':
        nickname.textContent = nick.value;
        sessionStorage.setItem(
          'nickname',
          JSON.stringify({ value: nick.value, mac: response.mac })
        );
        break;
      case 'reject':
        console.log('setNickname: nickname rejected:', response.reason);
        if (response.reason === 'duplicate')
          restoreNickname({ value: nick.value + '_' });
        break;
      default:
        console.log('setNickname: unknown result type');
        break;
    }
  });
}

function setNickname(value) {
  restoreNickname({ value });
}

function showNicknameInput() {
  nickModal.style.visibility = 'visible';
  nickInput.focus();
}

function submitNicknameInput() {
  setNickname(nickInput.value.trim() || nickname.textContent);
  nickModal.style.visibility = 'hidden';
  nickInput.value = '';
}

function postRoomJoin() {
  const nickname = JSON.parse(sessionStorage.getItem('nickname')) ||
    { value: `Gracz${Math.floor(Math.random() * 1e4)}` };
  restoreNickname(nickname);
}

function nextRound() {
  signaler.emit('nextRound');
}

// vim: set et ts=2 sw=2: kate: replace-tabs on; indent-width 2; tab-width 2;
