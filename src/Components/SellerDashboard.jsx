// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { Room, createLocalTracks } from "livekit-client";
// import "./SellerDashboard.css";

// const LIVEKIT_URL = "wss://test-project-yjtscd8m.livekit.cloud/";
//   const baseURL = "http://192.168.0.118:8000";

// const SellerDashboard = () => {
//   const [title, setTitle] = useState("");
//   const [message, setMessage] = useState("");
//   const [token, setToken] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [room, setRoom] = useState(null);
//   const [roomInfo, setRoomInfo] = useState(null); // to store room_id and room_name
//     const [endMessage, setEndMessage] = useState(""); // for end-live response


//   const localVideoRef = useRef(null);

//   useEffect(() => {
//     return () => {
//       if (room) {
//         room.disconnect();
//       }
//     };
//   }, [room]);

//     // Function to generate broadcaster identity with number
//   const generateBroadcasterIdentity = () => {
//     const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generates 4-digit number (1000-9999)
//     return `Broadcaster${randomNumber}`;
//   };

//   const handleStartLive = async () => {
//     const user_id = localStorage.getItem("user_id");
//     const user_name = localStorage.getItem("user_name");

//     if (!title.trim()) {
//       setMessage("Please enter a title for the live stream.");
//       return;
//     }

//     setLoading(true);
//     setMessage("");
//     setToken(null);

//     try {
//       const roomRes = await axios.post(`${baseURL}/live-streaming/create_room`, {
//         user_id: parseInt(user_id),
//         title: title,
//       });

//       if (roomRes.data.status) {
//         const { room_id, room_name } = roomRes.data.data;
//       setRoomInfo({ room_id, room_name }); // Store both
//       setMessage("Room created successfully!");

//         // Generate broadcaster identity with number
//         const broadcasterIdentity = generateBroadcasterIdentity();
//         console.log("Using broadcaster identity:", broadcasterIdentity);

//         const tokenRes = await axios.post(`${baseURL}/get-token`, {
//           username: user_name,
//           role: "Broadcaster",
//           identity: broadcasterIdentity ,
//           room: room_id,
//         });

//         if (tokenRes.data && tokenRes.data.token) {
//           const livekitToken = tokenRes.data.token;
//           setToken(livekitToken);
//           setMessage("Live stream started and token received!");
//           setTitle("");

//           // Join LiveKit room
//           await joinLiveKitRoom(livekitToken);
//         } else {
//           setMessage("Token generation failed.");
//         }
//       } else {
//         setMessage("Failed to create room.");
//       }
//     } catch (error) {
//       console.error("Live start error:", error);
//       setMessage("An error occurred while starting the live stream.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const joinLiveKitRoom = async (token) => {
//   try {
//     const livekitRoom = new Room({
//         adaptiveStream: true,
//         dynacast: true,
//       });

//     await livekitRoom.connect(LIVEKIT_URL, token ,  {
//         autoSubscribe: true,
//       });

//     setRoom(livekitRoom);

//     // Create local audio & video tracks
//     const localTracks = await createLocalTracks({
//       audio: true,
//       video: true,
//     });

//     // Publish tracks one by one (to avoid publishTracks issues)
//     for (const track of localTracks) {
//       await livekitRoom.localParticipant.publishTrack(track);
//     }

//     // Attach video track to video element
//     const videoTrack = localTracks.find((t) => t.kind === "video");
//     if (videoTrack && localVideoRef.current) {
//       localVideoRef.current.srcObject = new MediaStream([videoTrack.mediaStreamTrack]);
//       localVideoRef.current.play();
//     }

//     setMessage("Connected to live room and streaming!");
//   } catch (error) {
//     console.error("LiveKit join error:", error);
//     setMessage("Failed to connect to live stream.");
//   }
// };

// const handleEndLive = async () => {
//   const user_id = localStorage.getItem("user_id");

//   if (!roomInfo) return;

//   try {
//     const response = await axios.post(`${baseURL}/end-live`, {
//       user_id: parseInt(user_id),
//       room_id: roomInfo.room_id,
//       room_name: roomInfo.room_name,
//     });

//     if (response.data.status) {
//       setEndMessage(response.data.message);
//       setMessage("Live ended.");
//     } else {
//       setEndMessage("Failed to end live stream.");
//     }

//     // Clean up
//     if (room) {
//       room.disconnect();
//       setRoom(null);
//     }

//     setToken(null);
//     setRoomInfo(null);
//     setTitle("");
//   } catch (error) {
//     console.error("End live error:", error);
//     setEndMessage("An error occurred while ending the live stream.");
//   }
// };



//   return (
//     <div className="seller-dashboard">
//       <h2>Seller Dashboard</h2>

//       {token ? (
//   <div className="livekit-video-container">
//     <video
//       ref={localVideoRef}
//       autoPlay
//       muted
//       playsInline
//       style={{ width: "600px", borderRadius: "12px" }}
//     />

//     <button className="end-live-btn" onClick={handleEndLive}>
//       End Live
//     </button>

//     {endMessage && <p className="end-message">{endMessage}</p>}
//   </div>
// ) : (
//   <>
//     <div className="live-stream-form">
//       <input
//         type="text"
//         placeholder="Enter live stream title"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//       />

//       <button onClick={handleStartLive} disabled={loading}>
//         {loading ? "Starting..." : "Start Live"}
//       </button>
//     </div>

//     {message && <p className="message">{message}</p>}
//   </>
// )}

//     </div>
//   );
// };

// export default SellerDashboard;



// ⬇️ Full SellerDashboard.jsx
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import {
//   Room,
//   createLocalTracks,
//   createLocalVideoTrack,
//   RoomEvent,
// } from "livekit-client";
// import "./SellerDashboard.css";

// const baseURL = import.meta.env.VITE_API_BASE_URL;
// const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

// const SellerDashboard = () => {
//   const [title, setTitle] = useState("");
//   const [message, setMessage] = useState("");
//   const [token, setToken] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [room, setRoom] = useState(null);
//   const [roomInfo, setRoomInfo] = useState(null);
//   const [endMessage, setEndMessage] = useState("");
//   const [participants, setParticipants] = useState(0); 

//   const localVideoRef = useRef(null);
//   const currentVideoTrackRef = useRef(null);
//   const currentAudioTrackRef = useRef(null);

//   const [isMicOn, setIsMicOn] = useState(true);
//   const [isCameraOn, setIsCameraOn] = useState(true);

//   useEffect(() => {
//     const isLive = localStorage.getItem("is_live");
//     const savedToken = localStorage.getItem("live_token");
//     const savedRoomId = localStorage.getItem("live_room_id");
//     const savedRoomName = localStorage.getItem("live_room_name");

//     if (isLive === "true" && savedToken && savedRoomId && savedRoomName) {
//       setToken(savedToken);
//       setRoomInfo({ room_id: savedRoomId, room_name: savedRoomName });
//       joinLiveKitRoom(savedToken);
//     }

//     return () => {
//       if (room) {
//         room.disconnect();
//       }
//     };
//   }, []);

//   useEffect(() => {
//     const handleUnload = () => {
//       if (room) {
//         room.disconnect();
//       }
//     };
//     window.addEventListener("beforeunload", handleUnload);
//     return () => window.removeEventListener("beforeunload", handleUnload);
//   }, [room]);

//   const generateBroadcasterIdentity = () => {
//     const userId = localStorage.getItem("user_id");
//     const timestamp = Date.now();
//     return `Broadcaster_${userId}_${timestamp}`;
//   };

//   const handleStartLive = async () => {
//     const user_id = localStorage.getItem("user_id");
//     const user_name = localStorage.getItem("user_name");

//     if (!title.trim()) {
//       setMessage("Please enter a title for the live stream.");
//       return;
//     }

//     setLoading(true);
//     setMessage("");
//     setToken(null);
//     setEndMessage("");

//     const broadcasterIdentity = generateBroadcasterIdentity();

//     try {
//       const roomRes = await axios.post(`${baseURL}/live-streaming/create_room`, {
//         user_id,
//         title,
//         identity: String(user_id),
//       });

//       if (roomRes.data.status) {
//         const { room_id, room_name } = roomRes.data.data;
//         setRoomInfo({ room_id, room_name });

//         const tokenRes = await axios.post(`${baseURL}/get-token`, {
//           username: user_name,
//           role: "Broadcaster",
//           identity: broadcasterIdentity,
//           room: room_id,
//         });

//         if (tokenRes.data && tokenRes.data.token) {
//           const livekitToken = tokenRes.data.token;
//           setToken(livekitToken);
//           setTitle("");

//           localStorage.setItem("is_live", "true");
//           localStorage.setItem("live_token", livekitToken);
//           localStorage.setItem("live_room_id", room_id);
//           localStorage.setItem("live_room_name", room_name);

//           await joinLiveKitRoom(livekitToken);
//         } else {
//           setMessage("Token generation failed.");
//         }
//       } else {
//         setMessage("Failed to create room.");
//       }
//     } catch (error) {
//       console.error("Live start error:", error);
//       setMessage("An error occurred while starting the live stream.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const joinLiveKitRoom = async (token) => {
//     try {
//       const livekitRoom = new Room({
//         adaptiveStream: true,
//         dynacast: true,
//       });

//       await livekitRoom.connect(LIVEKIT_URL, token, {
//         autoSubscribe: true,
//       });

//       setRoom(livekitRoom);

//       const localTracks = await createLocalTracks({ audio: true, video: true });

//       for (const track of localTracks) {
//         await livekitRoom.localParticipant.publishTrack(track);
//         if (track.kind === "video") currentVideoTrackRef.current = track;
//         if (track.kind === "audio") currentAudioTrackRef.current = track;
//       }

//       const videoTrack = localTracks.find((t) => t.kind === "video");
//       if (videoTrack && localVideoRef.current) {
//         localVideoRef.current.srcObject = new MediaStream([videoTrack.mediaStreamTrack]);
//         localVideoRef.current.play();
//       }
//       setParticipants(livekitRoom.remoteParticipants.size);

//       // 👇 Listen to participant changes
//       livekitRoom.on(RoomEvent.ParticipantConnected, () => {
//         setParticipants((prev) => prev + 1);
//       });
//       livekitRoom.on(RoomEvent.ParticipantDisconnected, () => {
//         setParticipants((prev) => Math.max(1, prev - 1));
//       });

//       setMessage("Connected to live room and streaming!");
//     } catch (error) {
//       console.error("LiveKit join error:", error);
//       setMessage("Failed to connect to live stream.");
//     }
//   };

//   const toggleCamera = async () => {
//     if (!room || !currentVideoTrackRef.current) return;

//     if (isCameraOn) {
//       await room.localParticipant.unpublishTrack(currentVideoTrackRef.current);
//       currentVideoTrackRef.current.stop();
//       if (localVideoRef.current) localVideoRef.current.srcObject = null;
//     } else {
//       const videoTrack = await createLocalVideoTrack({
//   resolution: { width: 1280, height: 720 }, // or 1920x1080 for Full HD
//   frameRate: 30,
// });
//       await room.localParticipant.publishTrack(videoTrack);
//       currentVideoTrackRef.current = videoTrack;
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = new MediaStream([videoTrack.mediaStreamTrack]);
//         localVideoRef.current.play();
//       }
//     }

//     setIsCameraOn(!isCameraOn);
//   };

//   const toggleMic = async () => {
//     if (!room || !currentAudioTrackRef.current) return;

//     if (isMicOn) {
//       await room.localParticipant.unpublishTrack(currentAudioTrackRef.current);
//       currentAudioTrackRef.current.stop();
//     } else {
//       const audioTracks = await createLocalTracks({ audio: true });
//       const micTrack = audioTracks.find((t) => t.kind === "audio");
//       if (micTrack) {
//         await room.localParticipant.publishTrack(micTrack);
//         currentAudioTrackRef.current = micTrack;
//       }
//     }

//     setIsMicOn(!isMicOn);
//   };

//   const handleEndLive = async () => {
//     const user_id = localStorage.getItem("user_id");

//     if (!roomInfo || !user_id) {
//       setEndMessage("Missing room or user info to end stream.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await axios.post(`${baseURL}/end-live`, {
//         user_id: parseInt(user_id, 10),
//         room_id: roomInfo.room_id,
//         room_name: roomInfo.room_name,
//       });

//       if (response.data.status) {
//         setEndMessage(response.data.message || "Live stream ended.");
//       } else {
//         setEndMessage(response.data.message || "Failed to end live stream.");
//       }
//     } catch (error) {
//       setEndMessage("An error occurred: " + (error.response?.data?.message || error.message));
//     } finally {
//       if (room) {
//         room.disconnect();
//         setRoom(null);
//       }

//       setToken(null);
//       setRoomInfo(null);
//       setTitle("");
//       setMessage("");
//       setLoading(false);

//       localStorage.removeItem("is_live");
//       localStorage.removeItem("live_token");
//       localStorage.removeItem("live_room_id");
//       localStorage.removeItem("live_room_name");
//     }
//   };

//   return (
//     <div className="seller-dashboard">
//       <h2>Seller</h2>

//       {token ? (
//         <div className="livekit-video-container">
//           <video
//             ref={localVideoRef}
//             autoPlay
//             muted
//             playsInline
//             style={{ width: "600px", borderRadius: "12px" }}
//           />

//           {/* 👇 Participant Count */}
//           <p style={{ textAlign: "center", marginTop: "10px" }}>
//             👀 Viewers: <strong>{participants}</strong>
//           </p>
          

//           <div className="button-row">
//             <button
//               onClick={toggleMic}
//               disabled={!room || !currentAudioTrackRef.current}
//             >
//               {isMicOn ? "Mute Mic" : "Unmute Mic"}
//             </button>

//             <button
//               onClick={toggleCamera}
//               disabled={!room || (!currentVideoTrackRef.current && isCameraOn)}
//             >
//               {isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
//             </button>

//             <button onClick={handleEndLive} disabled={loading}>
//               {loading ? "Ending..." : "End Live"}
//             </button>
//           </div>

//           {endMessage && <p className="end-message">{endMessage}</p>}
//         </div>
//       ) : (
//         <div className="live-stream-form">
//           <input
//             type="text"
//             placeholder="Enter live stream title"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//           />
//           <button onClick={handleStartLive} disabled={loading || !title.trim()}>
//             {loading ? "Starting..." : "Start Live"}
//           </button>

//           {message && <p className="message">{message}</p>}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SellerDashboard;





// src/components/SellerDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Room,
  createLocalTracks,
  createLocalVideoTrack,
  RoomEvent,
} from "livekit-client";
import "./SellerDashboard.css";

const baseURL = import.meta.env.VITE_API_BASE_URL;
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

const SellerDashboard = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [room, setRoom] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [endMessage, setEndMessage] = useState("");
  const [participants, setParticipants] = useState(0);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatEnabled, setIsChatEnabled] = useState(false);

  const localVideoRef = useRef(null);
  const currentVideoTrackRef = useRef(null);
  const currentAudioTrackRef = useRef(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  useEffect(() => {
    const isLive = localStorage.getItem("is_live");
    const savedToken = localStorage.getItem("live_token");
    const savedRoomId = localStorage.getItem("live_room_id");
    const savedRoomName = localStorage.getItem("live_room_name");

    if (isLive === "true" && savedToken && savedRoomId && savedRoomName) {
      setToken(savedToken);
      setRoomInfo({ room_id: savedRoomId, room_name: savedRoomName });
      joinLiveKitRoom(savedToken);
    }

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const handleUnload = () => {
      if (room) {
        room.disconnect();
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [room]);

  const generateBroadcasterIdentity = () => {
    const userId = localStorage.getItem("user_id");
    const timestamp = Date.now();
    return `Broadcaster_${userId}_${timestamp}`;
  };

  const handleStartLive = async () => {
    const user_id = localStorage.getItem("user_id");
    const user_name = localStorage.getItem("user_name");

    if (!title.trim()) {
      setMessage("Please enter a title for the live stream.");
      return;
    }

    setLoading(true);
    setMessage("");
    setToken(null);
    setEndMessage("");

    const broadcasterIdentity = generateBroadcasterIdentity();

    try {
      const roomRes = await axios.post(`${baseURL}/live-streaming/create_room`, {
        user_id,
        title,
        identity: String(user_id),
      });

      if (roomRes.data.status) {
        const { room_id, room_name } = roomRes.data.data;
        setRoomInfo({ room_id, room_name });

        const tokenRes = await axios.post(`${baseURL}/get-token`, {
          username: user_name,
          role: "Broadcaster",
          identity: broadcasterIdentity,
          room: room_id,
        });

        if (tokenRes.data && tokenRes.data.token) {
          const livekitToken = tokenRes.data.token;
          setToken(livekitToken);
          setTitle("");

          localStorage.setItem("is_live", "true");
          localStorage.setItem("live_token", livekitToken);
          localStorage.setItem("live_room_id", room_id);
          localStorage.setItem("live_room_name", room_name);

          await joinLiveKitRoom(livekitToken);
        } else {
          setMessage("Token generation failed.");
        }
      } else {
        setMessage("Failed to create room.");
      }
    } catch (error) {
      console.error("Live start error:", error);
      setMessage("An error occurred while starting the live stream.");
    } finally {
      setLoading(false);
    }
  };

  const joinLiveKitRoom = async (token) => {
    try {
      const livekitRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      await livekitRoom.connect(LIVEKIT_URL, token, {
        autoSubscribe: true,
      });

      setRoom(livekitRoom);
      setIsChatEnabled(true);

      const localTracks = await createLocalTracks({ audio: true, video: true });

      for (const track of localTracks) {
        await livekitRoom.localParticipant.publishTrack(track);
        if (track.kind === "video") currentVideoTrackRef.current = track;
        if (track.kind === "audio") currentAudioTrackRef.current = track;
      }

      const videoTrack = localTracks.find((t) => t.kind === "video");
      if (videoTrack && localVideoRef.current) {
        localVideoRef.current.srcObject = new MediaStream([videoTrack.mediaStreamTrack]);
        localVideoRef.current.play().catch(err => console.error("Play error:", err));
      }

      setParticipants(livekitRoom.remoteParticipants.size);

      livekitRoom.on(RoomEvent.ParticipantConnected, () => {
        setParticipants((prev) => prev + 1);
      });
      livekitRoom.on(RoomEvent.ParticipantDisconnected, () => {
        setParticipants((prev) => Math.max(0, prev - 1));
      });

      // 🔥 Listen for incoming chat messages
      livekitRoom.on(RoomEvent.DataReceived, (payload, participant) => {
        try {
          const decoder = new TextDecoder();
          const text = decoder.decode(payload);
          const { type, message } = JSON.parse(text);

          if (type === "chat") {
            const sender = participant?.identity?.startsWith("Broadcaster_") ? "Seller" : "Viewer";
            const newMsg = {
              id: Date.now() + Math.random(),
              sender,
              text: message,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setChatMessages(prev => [...prev, newMsg]);
          }
        } catch (err) {
          console.warn("Failed to parse incoming message", err);
        }
      });

      setMessage("Connected to live room and streaming!");
    } catch (error) {
      console.error("LiveKit join error:", error);
      setMessage("Failed to connect to live stream.");
      setIsChatEnabled(false);
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !room || !isChatEnabled) return;

    const text = chatInput.trim();
    if (text.length > 500) {
      alert("Message too long (max 500 characters)");
      return;
    }

    try {
      const payload = new TextEncoder().encode(
        JSON.stringify({ type: "chat", message: text })
      );
      await room.localParticipant.publishData(payload, { kind: 'relayed' });

      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: "You (Seller)",
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
      setChatInput("");
    } catch (err) {
      console.error("Send failed", err);
      setMessage("Could not send message.");
    }
  };

  const toggleCamera = async () => {
    if (!room || !currentVideoTrackRef.current) return;

    if (isCameraOn) {
      await room.localParticipant.unpublishTrack(currentVideoTrackRef.current);
      currentVideoTrackRef.current.stop();
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
    } else {
      const videoTrack = await createLocalVideoTrack({
        resolution: { width: 1280, height: 720 },
        frameRate: 30,
      });
      await room.localParticipant.publishTrack(videoTrack);
      currentVideoTrackRef.current = videoTrack;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = new MediaStream([videoTrack.mediaStreamTrack]);
        localVideoRef.current.play().catch(err => console.error("Replay error:", err));
      }
    }
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = async () => {
    if (!room || !currentAudioTrackRef.current) return;

    if (isMicOn) {
      await room.localParticipant.unpublishTrack(currentAudioTrackRef.current);
      currentAudioTrackRef.current.stop();
    } else {
      const audioTracks = await createLocalTracks({ audio: true });
      const micTrack = audioTracks.find(t => t.kind === "audio");
      if (micTrack) {
        await room.localParticipant.publishTrack(micTrack);
        currentAudioTrackRef.current = micTrack;
      }
    }
    setIsMicOn(!isMicOn);
  };

  const handleEndLive = async () => {
    const user_id = localStorage.getItem("user_id");
    if (!roomInfo || !user_id) {
      setEndMessage("Missing room or user info.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${baseURL}/end-live`, {
        user_id: parseInt(user_id, 10),
        room_id: roomInfo.room_id,
        room_name: roomInfo.room_name,
      });

      if (response.data.status) {
        setEndMessage(response.data.message || "Live stream ended.");
      } else {
        setEndMessage(response.data.message || "Failed to end live stream.");
      }
    } catch (error) {
      setEndMessage("Error: " + (error.response?.data?.message || error.message));
    } finally {
      if (room) room.disconnect();
      setRoom(null);
      setToken(null);
      setRoomInfo(null);
      setTitle("");
      setMessage("");
      setLoading(false);
      setChatMessages([]);

      localStorage.removeItem("is_live");
      localStorage.removeItem("live_token");
      localStorage.removeItem("live_room_id");
      localStorage.removeItem("live_room_name");
    }
  };

  return (
    <div className="seller-dashboard">
      <h2>Seller</h2>

      {token ? (
        <div className="livekit-stream-container">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{ width: "600px", borderRadius: "12px" }}
          />
          <p style={{ textAlign: "center", marginTop: "10px" }}>
            👀 Viewers: <strong>{participants}</strong>
          </p>

          {/* Chat Box */}
          <div className="livekit-chat-wrapper" style={{
            marginTop: "20px",
            border: "1px solid #ddd",
            borderRadius: "12px",
            overflow: "hidden",
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}>
            <div style={{
              backgroundColor: "#f5f5f5",
              padding: "10px",
              fontWeight: "600",
              borderBottom: "1px solid #eee",
            }}>
              Live Chat
            </div>

            <div className="chat-messages" style={{
              height: "200px",
              overflowY: "auto",
              padding: "10px",
              backgroundColor: "#fcfcfc",
              fontSize: "14px",
            }}>
              {chatMessages.length === 0 ? (
                <p style={{ color: "#999", textAlign: "center", marginTop: "20px" }}>
                  No messages yet.
                </p>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} style={{ marginBottom: "8px", maxWidth: "90%" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#555",
                      fontSize: "12px",
                      marginBottom: "2px",
                    }}>
                      <strong>{msg.sender}</strong>
                      <span style={{ color: "#999" }}>{msg.timestamp}</span>
                    </div>
                    <p style={{
                      margin: 0,
                      padding: "6px 10px",
                      backgroundColor: msg.sender === "You (Seller)" ? "#1a73e8" : "#e0e0e0",
                      color: msg.sender === "You (Seller)" ? "white" : "black",
                      borderRadius: "18px",
                      wordBreak: "break-word",
                    }}>
                      {msg.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendChatMessage} style={{
              display: "flex",
              padding: "8px",
              borderTop: "1px solid #eee",
            }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                disabled={!isChatEnabled}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "20px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={!isChatEnabled || !chatInput.trim()}
                style={{
                  marginLeft: "8px",
                  padding: "0 16px",
                  backgroundColor: !chatInput.trim() ? "#ccc" : "#1a73e8",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  cursor: !chatInput.trim() ? "not-allowed" : "pointer",
                }}
              >
                Send
              </button>
            </form>
          </div>

          <div className="button-row" style={{ marginTop: "16px" }}>
            <button onClick={toggleMic} disabled={!room || !currentAudioTrackRef.current}>
              {isMicOn ? "Mute Mic" : "Unmute Mic"}
            </button>
            <button
              onClick={toggleCamera}
              disabled={!room || (!currentVideoTrackRef.current && isCameraOn)}
            >
              {isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
            </button>
            <button onClick={handleEndLive} disabled={loading}>
              {loading ? "Ending..." : "End Live"}
            </button>
          </div>

          {endMessage && <p className="end-message">{endMessage}</p>}
        </div>
      ) : (
        <div className="live-stream-form">
          <input
            type="text"
            placeholder="Enter live stream title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button onClick={handleStartLive} disabled={loading || !title.trim()}>
            {loading ? "Starting..." : "Start Live"}
          </button>
          {message && <p className="message">{message}</p>}
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;

