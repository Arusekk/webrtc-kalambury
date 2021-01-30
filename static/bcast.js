const activeChannels = [],
      connections = {}

function broadcast(data) {
  activeChannels.forEach(chan => chan.send(data))
}

window.addEventListener('load', () => {
  setupGameIO()

  signaler.on('disconnects', addr => delete connections[addr])

  signaler.on('candidate from', ({ candidate, addr }) => connections[addr].pc.addIceCandidate(candidate))
  signaler.on('sdp from', async ({ sdp, addr }) => {
    console.log("wants to connect", addr, sdp)
    if (connections[addr])
      connections[addr].onsdp(sdp)
    else {
      const { pc, onsdp } = connections[addr] = getRTCPeerConnection(addr)

      // set up success handling
      pc.ondatachannel = ({ channel }) => {
        console.log("Got connection", channel)
        channel.send(JSON.stringify({
          type: 'img',
          dataurl: picture.ctx.canvas.toDataURL()
        }))
        activeChannels.push(channel)
      }

      onsdp(sdp)
    }
  })

  // create the room now that we are ready
  signaler.emit('room', { name: location.hash.slice(1), mode: 'draw' })

  postRoomJoin();
})

// vim: set et ts=2 sw=2: kate: replace-tabs on; indent-width 2; tab-width 2;
