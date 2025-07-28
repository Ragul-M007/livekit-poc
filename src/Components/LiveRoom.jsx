// // src/Components/LiveRoom.js
// import React, { useEffect, useRef, useState } from "react";
// import { Room, connect, RoomEvent } from "livekit-client";

// const LiveRoom = ({ token, roomId }) => {
//   const livekitURL = "wss://test-project-yjtscd8m.livekit.cloud/"; // Replace this with your actual LiveKit Cloud URL
//   const [room, setRoom] = useState(null);
//   const [connected, setConnected] = useState(false);
//   const videoRef = useRef();

//   useEffect(() => {
//     const room = new Room();

//     const start = async () => {
//       try {
//         await connect(room, livekitURL, token);
//         setRoom(room);
//         setConnected(true);

//         // Publish local tracks (camera and mic)
//         const tracks = await room.createLocalTracks();
//         tracks.forEach(track => {
//           room.localParticipant.publishTrack(track);

//           // Show video track in the video element
//           if (track.kind === "video") {
//             track.attach(videoRef.current);
//           }
//         });

//         // Optional: Listen to other participants
//         room.on(RoomEvent.ParticipantConnected, (participant) => {
//           console.log("Participant connected:", participant.identity);
//         });

//       } catch (err) {
//         console.error("Failed to connect to room", err);
//       }
//     };

//     start();

//     return () => {
//       room.disconnect();
//     };
//   }, [token, livekitURL]);

//   return (
//     <div>
//       <h2>Live Room: {roomId}</h2>
//       <video ref={videoRef} autoPlay muted playsInline style={{ width: "500px" }} />
//       {connected ? <p>You're live 🎥</p> : <p>Connecting...</p>}
//     </div>
//   );
// };

// export default LiveRoom;
