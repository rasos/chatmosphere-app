import React, { useEffect, useRef, useState } from 'react';
import { User } from '../User';
import { conferenceName, conferenceOptions, jitsiInitOptions } from './options';
import {useStore} from './store'

export const Room = ({roomName, JitsiMeetJS, connection}) => {

  const [room, setRoom] = useState(undefined)

  //publicStore
  const addUser = useStore(state => state.addUser)
  const removeUser = useStore(state => state.removeUser)
  const addAudioTrack = useStore(state => state.addAudioTrack)
  const addVideoTrack = useStore(state => state.addVideoTrack)
  const users = useStore(state => state.users)
  
  useEffect(() => {
    if(connection && JitsiMeetJS) {
      const r = connection.initJitsiConference(roomName, conferenceOptions)
      r.on(JitsiMeetJS.events.conference.TRACK_ADDED, on_remote_track_added)
      r.on(JitsiMeetJS.events.conference.TRACK_REMOVED, on_remote_track_removed)
      r.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, on_conference_joined)
      r.on(JitsiMeetJS.events.conference.USER_JOINED, on_user_joined)
      r.on(JitsiMeetJS.events.conference.USER_LEFT, on_user_left)
      // r.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, onTrackToggleMuted);
      // r.on(JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, onUserNameChanged);
      r.on(JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED, on_remote_track_audio_level_changed);
      // r.on(JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED, onPhoneNumberChanged);
      r.addCommandListener("pos", on_position_received)
      r.join(); // FFFUUUUUUUUUUUUCK THATS IT GOD DAMNIT
      setRoom(r)
    }
    return((r) => {
        // if(room !== undefined) room.leave() //this throws errors, but why? guess i need a callback like https://github.com/jitsi/lib-jitsi-meet/issues/1330#issuecomment-703742442
        console.log("ROOM LEAVE CALLED, connection is ", r)
    })
  },[connection])

  const on_remote_track_added = (track) => {
    if(track.isLocal()) return // also run on your own tracks so exit
    track.addEventListener(JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,() => console.log('remote track stopped'))
    track.addEventListener(JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,deviceId =>console.log(`track audio output device was changed to ${deviceId}`))

    const id = track.getParticipantId() // get user id of track
    track.getType() === "audio" ? addAudioTrack(id, track) : addVideoTrack(id, track)
  }

  const on_remote_track_removed = (track) => {
    console.log()
  }

  const on_conference_joined = () => {

  }
  const on_user_joined = (id) => {
    addUser(id)
  }

  const on_user_left = (id) => {
    removeUser(id)
  }
  const on_remote_track_audio_level_changed = () => {

  }
  const on_position_received = () => {

  } 

  return (
    <div>
      {Object.keys(users).map((id) => {
        return(
            <User key={id} id={id}/>
        )
      })}
    </div>
  )
}
