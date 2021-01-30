window.addEventListener('load', async () => {
  setupGameIO(false)

  signaler.emit('room', { name: location.hash.slice(1), mode: 'view' })

  postRoomJoin();

  // set up WebRTC handlers
  signaler.on('candidate', async candidate => await pc.addIceCandidate(candidate))
  const { pc, onsdp } = getRTCPeerConnection()
  signaler.on('sdp', onsdp)

  // prepare for successful connection
  // should be ordered by default, but let's be explicit
  const chan = pc.createDataChannel('sendDataChannel', { ordered: true })
  chan.onopen = () => console.log('Connection successful!', chan)
  chan.onmessage = ({ data }) => {
    console.log('Got msg!', data.slice(0, 256))
    try {
      handleViewMessage(JSON.parse(data))
    } catch (err) {
      console.log('Failed to parse msg.');
    }
  }

  // we want the creator to connect to us now that we are ready
  await pc.setLocalDescription()
  signaler.emit('webrtc to', { sdp: pc.localDescription })
})

// vim: set et ts=2 sw=2: kate: replace-tabs on; indent-width 2; tab-width 2;
