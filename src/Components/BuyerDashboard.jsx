// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { Room, RoomEvent } from "livekit-client";
// import "./BuyerDashboard.css";

// const baseURL = import.meta.env.VITE_API_BASE_URL;
// const LIVEKIT_URL = "wss://test-project-yjtscd8m.livekit.cloud/";

// const BuyerDashboard = () => {
//   const [liveUsers, setLiveUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeRooms, setActiveRooms] = useState([]); // Track multiple room connections
//   const [message, setMessage] = useState("");
//   const videoContainersRef = useRef({}); // Store refs for multiple video containers

//   useEffect(() => {
//     fetchLiveUsers();
//     return () => {
//       // Clean up all active rooms when component unmounts
//       activeRooms.forEach(roomInfo => {
//         if (roomInfo.room) {
//           roomInfo.room.disconnect();
//         }
//       });
//     };
//   }, []);

//   const fetchLiveUsers = async () => {
//     try {
//       const res = await axios.get(`${baseURL}/get-users`);
//       if (res.data.status) {
//         const live = res.data.data.flatMap((user) =>
//           user.stream_sessions
//             .filter((session) => session.stream_is_live)
//             .map((session) => ({
//               user_id: user.user_id,
//               user_name: user.user_name,
//               room_name: session.room_name,
//               room_id: session.room_id,
//             }))
//         );
//         setLiveUsers(live);
//       } else {
//         setMessage("Failed to fetch users.");
//       }
//     } catch (error) {
//       console.error("Fetch error:", error);
//       setMessage("An error occurred while fetching users.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleJoin = async (room_id) => {
//     console.log("Join button clicked for room:", room_id);
//     const username = localStorage.getItem("user_name") || "Viewer";

//     try {
//       const res = await axios.post(`${baseURL}/get-token`, {
//         username: username,
//         role: "viewer",
//         room: room_id,
//       });

//       if (res.data?.token) {
//         const token = res.data.token;
//         await connectToLiveRoom(token, room_id);
//       } else {
//         setMessage("Failed to retrieve token.");
//       }
//     } catch (error) {
//       console.error("Join error:", error);
//       setMessage("Error joining the stream.");
//     }
//   };

//   const connectToLiveRoom = async (token, room_id) => {
//     try {
//       // Check if already connected to this room
//       if (activeRooms.some(roomInfo => roomInfo.room_id === room_id)) {
//         setMessage("Already connected to this stream!");
//         return;
//       }

//       // Connect with autoSubscribe disabled
//       const room = new Room({
//         adaptiveStream: true,
//         dynacast: true,
//       });

//       await room.connect(LIVEKIT_URL, token, {
//         autoSubscribe: false,
//       });

//       // Handle track published events
//       room.on(RoomEvent.TrackPublished, (publication, participant) => {
//         console.log(`Track published in room ${room_id}:`, publication.kind);
//         publication.setSubscribed(true);
//       });

//       // Handle track subscribed events
//       room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
//         console.log(`Track subscribed in room ${room_id}:`, track.kind);

//         const element = track.attach();
//         element.autoplay = true;
//         element.playsInline = true;

//         if (track.kind === "video") {
//           element.style.width = "100%";
//           element.style.borderRadius = "12px";

//           // Get the container for this specific room
//           const containerId = `video-container-${room_id}`;
//           const container = document.getElementById(containerId);
//           if (container) {
//             container.innerHTML = "";
//             container.appendChild(element);
//           }
//         } else if (track.kind === "audio") {
//           // Audio elements don't need to be visible
//           document.body.appendChild(element);
//         }
//       });

//       // Subscribe to existing tracks
//       room.remoteParticipants.forEach((participant) => {
//         participant.trackPublications.forEach((publication) => {
//           publication.setSubscribed(true);
//         });
//       });

//       // Add this room to active rooms
//       setActiveRooms(prev => [
//         ...prev,
//         { room_id, room, container_id: `video-container-${room_id}` }
//       ]);

//       setMessage(`Joined live stream for room ${room_id}!`);
//     } catch (error) {
//       console.error("LiveKit connect error:", error);
//       setMessage("Failed to connect to live stream.");
//     }
//   };

//   const handleLeave = (room_id) => {
//     // Find and disconnect the specific room
//     const roomInfo = activeRooms.find(r => r.room_id === room_id);
//     if (roomInfo && roomInfo.room) {
//       roomInfo.room.disconnect();
//     }

//     // Remove from active rooms
//     setActiveRooms(prev => prev.filter(r => r.room_id !== room_id));

//     // Clear the video container
//     const containerId = `video-container-${room_id}`;
//     const container = document.getElementById(containerId);
//     if (container) {
//       container.innerHTML = "";
//     }

//     setMessage("");
//   };

//   return (
//     <div className="buyer-dashboard">
//       <h2>Buyer Dashboard</h2>

//       {message && <p className="message">{message}</p>}

//       {activeRooms.length > 0 && (
//         <div className="active-streams">
//           <h3>Active Streams</h3>
//           {activeRooms.map((roomInfo) => (
//             <div key={roomInfo.room_id} className="stream-container">
//               <div
//                 id={roomInfo.container_id}
//                 style={{
//                   width: "600px",
//                   height: "400px",
//                   backgroundColor: "black",
//                   borderRadius: "12px",
//                   overflow: "hidden",
//                   margin: "10px auto"
//                 }}
//               />
//               <button
//                 onClick={() => handleLeave(roomInfo.room_id)}
//                 className="leave-btn"
//                 style={{
//                   marginTop: "10px",
//                   display: "block",
//                   margin: "10px auto"
//                 }}
//               >
//                 Leave Stream
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       {loading ? (
//         <p>Loading...</p>
//       ) : liveUsers.length === 0 ? (
//         <p>No live users currently.</p>
//       ) : (
//         <div className="live-users-list">
//           <h3>Available Live Streams</h3>
//           {liveUsers.map((user, index) => {
//             const isConnected = activeRooms.some(roomInfo => roomInfo.room_id === user.room_id);
//             return (
//               <div key={`${user.user_id}-${user.room_id}`} className="live-user-card">
//                 <p><strong>{user.user_name}</strong></p>
//                 <p>Room: {user.room_name}</p>
//                 <button
//                   onClick={() => handleJoin(user.room_id)}
//                   className="join-btn"
//                   disabled={isConnected}
//                 >
//                   {isConnected ? "Connected" : "Join"}
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default BuyerDashboard;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Room, RoomEvent } from "livekit-client";
// import "./BuyerDashboard.css";

// const baseURL = import.meta.env.VITE_API_BASE_URL;
// const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

// const BuyerDashboard = () => {
//   const [liveUsers, setLiveUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeRoom, setActiveRoom] = useState(null);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     fetchLiveUsers();

//     return () => {
//       if (activeRoom?.room) {
//         activeRoom.room.disconnect();
//       }
//     };
//   }, []);

//   const generateViewerIdentity = () => {
//     const randomNumber = Math.floor(1000 + Math.random() * 9000);
//     return `Viewer${randomNumber}`;
//   };

//   const fetchLiveUsers = async () => {
//     try {
//       const res = await axios.get(`${baseURL}/get-users`);
//       if (res.data.status) {
//         const live = res.data.data.flatMap((user) =>
//           user.stream_sessions
//             .filter((session) => session.stream_is_live)
//             .map((session) => ({
//               user_id: user.user_id,
//               user_name: user.user_name,
//               room_name: session.room_name,
//               room_id: session.room_id,
//             }))
//         );
//         setLiveUsers(live);
//       } else {
//         setMessage("Failed to fetch users.");
//       }
//     } catch (error) {
//       console.error("Fetch error:", error);
//       setMessage("An error occurred while fetching users.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleJoin = async (room_id, room_name, user_name) => {
//     const username = localStorage.getItem("user_name") || "Viewer";
//     const viewerIdentity = generateViewerIdentity();

//     if (activeRoom?.room_id === room_id) {
//       setMessage("Already connected to this stream.");
//       return;
//     }

//     try {
//       const res = await axios.post(`${baseURL}/get-token`, {
//         username,
//         role: "viewer",
//         identity: viewerIdentity,
//         room: room_id,
//       });

//       if (res.data?.token) {
//         await connectToLiveRoom(res.data.token, room_id, room_name, user_name);
//       } else {
//         setMessage("Failed to retrieve token.");
//       }
//     } catch (error) {
//       console.error("Join error:", error);
//       setMessage("Error joining the stream.");
//     }
//   };

//   const connectToLiveRoom = async (token, room_id, room_name, user_name) => {
//     const room = new Room({ adaptiveStream: true, dynacast: true });

//     await room.connect(LIVEKIT_URL, token, {
//       autoSubscribe: false,
//     });

//     room.remoteParticipants.forEach((participant) => {
//       participant.trackPublications.forEach((publication) => {
//         publication.setSubscribed(true);
//       });
//     });

//     room.on(RoomEvent.TrackPublished, async(publication) => {
//       publication.setSubscribed(true);
//         if (publication.kind === "video" && publication.videoTrack) {
//     // Manually set video layer if simulcast is used
//     await publication.videoTrack.setVideoQuality('high');
//   }
//     });

//     room.on(RoomEvent.TrackSubscribed, (track) => {
//       const container = document.getElementById("video-container");
//       const element = track.attach();
//       element.autoplay = true;
//       element.playsInline = true;
//       element.muted = false;

//       if (track.kind === "video") {
//         element.style.width = "100%";
//         element.style.borderRadius = "12px";
//         if (container) {
//           container.innerHTML = "";
//           container.appendChild(element);
//         }
//       } else if (track.kind === "audio") {
//         document.body.appendChild(element);
//         element.play().catch((err) => {
//           console.warn("Audio play failed:", err);
//           setMessage((prev) => prev + " Audio might require interaction.");
//         });
//       }
//     });

//     room.on(RoomEvent.TrackUnsubscribed, (track) => {
//       track.detach();
//     });

//     const initialCount = room.remoteParticipants.size;

//     const updateParticipants = (change) => {
//       setActiveRoom((prev) => ({
//         ...prev,
//         participants: (prev.participants || initialCount) + change,
//       }));
//     };

//     room.on(RoomEvent.ParticipantConnected, () => updateParticipants(1));
//     room.on(RoomEvent.ParticipantDisconnected, () => updateParticipants(-1));

//     room.on(RoomEvent.Disconnected, () => {
//       setActiveRoom(null);
//       setMessage("The live stream has ended.");
//     });

//     setActiveRoom({
//       room_id,
//       room,
//       room_name,
//       user_name,
//       participants: initialCount,
//     });
//   };

//   const handleLeave = () => {
//     if (activeRoom?.room) {
//       activeRoom.room.disconnect();
//     }
//     setActiveRoom(null);
//     setMessage("You have left the stream.");
//   };

//   return (
//     <div className="buyer-dashboard">
//       <h2>Buyer Dashboard</h2>

//       {message && <p className="message">{message}</p>}

//       {!activeRoom && !loading && liveUsers.length === 0 && (
//         <p>No live users currently.</p>
//       )}

//       {!activeRoom && !loading && liveUsers.length > 0 && (
//         <div className="live-users-list">
//           <h3>Available Live Streams</h3>
//           {liveUsers.map((user) => (
//             <div
//               key={`${user.user_id}-${user.room_id}`}
//               className="live-user-card"
//             >
//               <p>
//                 <strong>{user.user_name}</strong>
//               </p>
//               <p>Live: {user.room_name}</p>
//               <button
//                 className="join-btn"
//                 onClick={() =>
//                   handleJoin(user.room_id, user.room_name, user.user_name)
//                 }
//               >
//                 Join Stream
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       {activeRoom && (
//         <div className="active-stream">
//           <h3>🎥 {activeRoom.room_name}</h3>
//           <p>👤 Host: {activeRoom.user_name}</p>
//           <p>👥 Viewers: {activeRoom.participants}</p>

//           <div
//             id="video-container"
//             className="livekit-video-container"
//           ></div>

//           <button className="leave-btn" onClick={handleLeave}>
//             Leave Stream
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BuyerDashboard;

// src/components/BuyerDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Room, RoomEvent } from "livekit-client";
import "./BuyerDashboard.css";

const baseURL = import.meta.env.VITE_API_BASE_URL;
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

const BuyerDashboard = () => {
  const [liveUsers, setLiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);
  const [message, setMessage] = useState("");

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatReady, setIsChatReady] = useState(false);

  useEffect(() => {
    const reconnectIfNeeded = async () => {
      const saved = localStorage.getItem("active_stream");
      if (saved) {
        const { room_id, room_name, host_name, token } = JSON.parse(saved);
        try {
          await connectToLiveRoom(token, room_id, room_name, host_name);
          setMessage("Reconnected to the live stream.");
        } catch (err) {
          console.error("Reconnect error:", err);
          localStorage.removeItem("active_stream");
          setMessage("Failed to reconnect.");
          fetchLiveUsers();
        }
      } else {
        fetchLiveUsers();
      }
    };

    reconnectIfNeeded();

    return () => {
      if (activeRoom?.room) {
        activeRoom.room.disconnect();
      }
    };
  }, []);

  const generateViewerIdentity = () => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `Viewer${randomNumber}`;
  };

  const fetchLiveUsers = async () => {
    try {
      const res = await axios.get(`${baseURL}/get-users`);
      if (res.data.status) {
        const live = res.data.data.flatMap((user) =>
          user.stream_sessions
            .filter((session) => session.stream_is_live)
            .map((session) => ({
              user_id: user.user_id,
              user_name: user.user_name,
              room_name: session.room_name,
              room_id: session.room_id,
            }))
        );
        setLiveUsers(live);
      } else {
        setMessage("Failed to fetch users.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("An error occurred while fetching users.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (room_id, room_name, host_name) => {
    const username = localStorage.getItem("user_name") || "Viewer";
    const viewerIdentity = generateViewerIdentity();

    if (activeRoom?.room_id === room_id) {
      setMessage("Already connected to this stream.");
      return;
    }

    try {
      const res = await axios.post(`${baseURL}/get-token`, {
        username,
        role: "viewer",
        identity: viewerIdentity,
        room: room_id,
      });

      if (res.data?.token) {
        localStorage.setItem(
          "active_stream",
          JSON.stringify({
            room_id,
            room_name,
            host_name,
            token: res.data.token,
            viewer_identity: viewerIdentity,
          })
        );
        await connectToLiveRoom(res.data.token, room_id, room_name, host_name);
      } else {
        setMessage("Failed to retrieve token.");
      }
    } catch (error) {
      console.error("Join error:", error);
      setMessage("Error joining the stream.");
    }
  };

  const connectToLiveRoom = async (token, room_id, room_name, user_name) => {
    const room = new Room({ adaptiveStream: true, dynacast: true });

    await room.connect(LIVEKIT_URL, token, {
      autoSubscribe: false,
    });

    room.remoteParticipants.forEach((p) => {
      p.trackPublications.forEach((pub) => pub.setSubscribed(true));
    });

    room.on(RoomEvent.TrackPublished, async (publication) => {
      await publication.setSubscribed(true);
      if (publication.kind === "video" && publication.videoTrack) {
        await publication.videoTrack.setVideoQuality("high");
      }
    });

    room.on(RoomEvent.TrackSubscribed, (track) => {
      const container = document.getElementById("video-container");
      const element = track.attach();
      element.autoplay = true;
      element.playsInline = true;

      if (track.kind === "video") {
        element.style.width = "100%";
        element.style.borderRadius = "12px";
        if (container) {
          container.innerHTML = "";
          container.appendChild(element);
        }
      } else if (track.kind === "audio") {
        element.style.display = "none"; // Optional: Hide audio UI
        document.body.appendChild(element);

        const playPromise = element.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio started successfully.");
            })
            .catch((err) => {
              console.warn("Audio playback blocked by browser:", err);
              setMessage("🔇 Click 'Resume Audio' to hear the stream.");
              window.__pendingAudio = element; // Store for later
            });
        }
      }
    });

    room.on(RoomEvent.TrackUnsubscribed, (track) => {
      track.detach();
    });

    // Participant count
    let initialCount = room.remoteParticipants.size;
    const updateParticipants = (change) => {
      setActiveRoom((prev) => ({
        ...prev,
        participants: (prev?.participants || initialCount) + change,
      }));
    };
    room.on(RoomEvent.ParticipantConnected, () => updateParticipants(1));
    room.on(RoomEvent.ParticipantDisconnected, () => updateParticipants(-1));

    // 🔥 Chat: Listen for messages
    room.on(RoomEvent.DataReceived, (payload, participant) => {
      try {
        const decoder = new TextDecoder();
        const text = decoder.decode(payload);
        const { type, message } = JSON.parse(text);

        if (type === "chat") {
          const sender = participant?.identity?.startsWith("Broadcaster_")
            ? "Seller"
            : "Viewer";
          const newMsg = {
            id: Date.now() + Math.random(),
            sender,
            text: message,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setChatMessages((prev) => [...prev, newMsg]);
        }
      } catch (err) {
        console.warn("Failed to parse chat message", err);
      }
    });

    // Enable chat input
    setIsChatReady(true);

    room.on(RoomEvent.Disconnected, () => {
      setActiveRoom(null);
      setMessage("The live stream has ended.");
      setChatMessages([]);
      setIsChatReady(false);
    });

    setActiveRoom({
      room_id,
      room,
      room_name,
      user_name,
      participants: initialCount,
    });
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeRoom?.room || !isChatReady) return;

    const text = chatInput.trim();
    if (text.length > 500) {
      alert("Message too long");
      return;
    }

    try {
      const payload = new TextEncoder().encode(
        JSON.stringify({ type: "chat", message: text })
      );
      await activeRoom.room.localParticipant.publishData(payload, {
        kind: "relayed",
      });

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "You",
          text,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setChatInput("");
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  const handleLeave = () => {
    if (activeRoom?.room) {
      activeRoom.room.disconnect();
    }
    localStorage.removeItem("active_stream");
    setActiveRoom(null);
    setChatMessages([]);
    setIsChatReady(false);
    setMessage("You have left the stream.");
  };

  return (
    <div className="buyer-dashboard">
      <h2>Buyer Dashboard</h2>
      {message && <p className="message">{message}</p>}

      {!activeRoom && !loading && liveUsers.length === 0 && (
        <p>No live users currently.</p>
      )}

      {!activeRoom && !loading && liveUsers.length > 0 && (
        <div className="live-users-list">
          <h3>Available Live Streams</h3>
          {liveUsers.map((user) => (
            <div
              key={`${user.user_id}-${user.room_id}`}
              className="live-user-card"
            >
              <p>
                <strong>{user.user_name}</strong>
              </p>
              <p>Live: {user.room_name}</p>
              <button
                className="join-btn"
                onClick={() =>
                  handleJoin(user.room_id, user.room_name, user.user_name)
                }
              >
                Join Stream
              </button>
            </div>
          ))}
        </div>
      )}

      {activeRoom && (
        <div className="active-stream">
          <h3>🎥 {activeRoom.room_name}</h3>
          <p>👤 Host: {activeRoom.user_name}</p>
          <p>👥 Viewers: {activeRoom.participants}</p>
          {window.__pendingAudio && (
  <button
    onClick={() => {
      window.__pendingAudio.play()
        .then(() => {
          setMessage("🔊 Audio resumed.");
          window.__pendingAudio = null;
        })
        .catch((err) => {
          console.error("Resume failed", err);
        });
    }}
    style={{
      marginTop: "12px",
      padding: "8px 16px",
      backgroundColor: "#1a73e8",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    🔊 Resume Audio
  </button>
)}


          <div id="video-container" className="livekit-video-container"></div>

          {/* Chat Box */}
          <div
            className="livekit-chat-wrapper"
            style={{
              marginTop: "20px",
              border: "1px solid #ddd",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "10px",
                fontWeight: "600",
                borderBottom: "1px solid #eee",
              }}
            >
              Live Chat
            </div>

            <div
              className="chat-messages"
              style={{
                height: "200px",
                overflowY: "auto",
                padding: "10px",
                backgroundColor: "#fcfcfc",
                fontSize: "14px",
              }}
            >
              {chatMessages.length === 0 ? (
                <p
                  style={{
                    color: "#999",
                    textAlign: "center",
                    marginTop: "20px",
                  }}
                >
                  No messages yet.
                </p>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{ marginBottom: "8px", maxWidth: "90%" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#555",
                        fontSize: "12px",
                        marginBottom: "2px",
                      }}
                    >
                      <strong>{msg.sender}</strong>
                      <span style={{ color: "#999" }}>{msg.timestamp}</span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        padding: "6px 10px",
                        backgroundColor:
                          msg.sender === "You" ? "#1a73e8" : "#e0e0e0",
                        color: msg.sender === "You" ? "white" : "black",
                        borderRadius: "18px",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={sendChatMessage}
              style={{
                display: "flex",
                padding: "8px",
                borderTop: "1px solid #eee",
              }}
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Send a message..."
                disabled={!isChatReady}
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
                disabled={!isChatReady || !chatInput.trim()}
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

          <button
            className="leave-btn"
            onClick={handleLeave}
            style={{
              marginTop: "12px",
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Leave Stream
          </button>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
