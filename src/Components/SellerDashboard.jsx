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



import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Room, createLocalTracks , createLocalVideoTrack } from "livekit-client";
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

    const [videoDeviceId, setVideoDeviceId] = useState(null); 
    const [videoDevices, setVideoDevices] = useState([]);     
    const currentVideoTrackRef = useRef(null);   

    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const currentAudioTrackRef = useRef(null); 


  const localVideoRef = useRef(null);

  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  // ✅ Fetch all video input devices when component mounts
useEffect(() => {
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    const videos = devices.filter((d) => d.kind === "videoinput");
    setVideoDevices(videos);
    if (videos.length > 0) {
      setVideoDeviceId(videos[0].deviceId); // default to first device
    }
  });
}, []);




    const switchCamera = async () => {
  if (!room || videoDevices.length < 2) return;

  const currentIndex = videoDevices.findIndex(d => d.deviceId === videoDeviceId);
  const nextIndex = (currentIndex + 1) % videoDevices.length;
  const nextDeviceId = videoDevices[nextIndex].deviceId;

  try {
    const newVideoTrack = await createLocalVideoTrack({
      deviceId: { exact: nextDeviceId }
    });

    if (currentVideoTrackRef.current) {
      await room.localParticipant.unpublishTrack(currentVideoTrackRef.current);
      currentVideoTrackRef.current.stop();
    }

    await room.localParticipant.publishTrack(newVideoTrack);
    currentVideoTrackRef.current = newVideoTrack;
    setVideoDeviceId(nextDeviceId);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = new MediaStream([newVideoTrack.mediaStreamTrack]);
      localVideoRef.current.play();
    }
  } catch (error) {
    console.error("Error switching camera:", error);
    setMessage("Failed to switch camera.");
  }
};


//   const generateBroadcasterIdentity = () => {
//     const randomNumber = Math.floor(1000 + Math.random() * 9000);
//     return `Broadcaster${randomNumber}`;
//   };

const generateBroadcasterIdentity = () => {
  const userId = localStorage.getItem("user_id");
  const timestamp = Date.now(); // milliseconds since epoch
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
    setEndMessage(""); // Clear any previous end messages

    const broadcasterIdentity = generateBroadcasterIdentity();
        console.log("Using broadcaster identity:", broadcasterIdentity);

    try {
      const roomRes = await axios.post(`${baseURL}/live-streaming/create_room`, {
        user_id: (user_id),
        title: title,
        identity: String(user_id),

      });

      if (roomRes.data.status) {
        const { room_id, room_name } = roomRes.data.data;
        setRoomInfo({ room_id, room_name });
        setMessage("Room created successfully!");

        const broadcasterIdentity = generateBroadcasterIdentity();
        console.log("Using broadcaster identity:", broadcasterIdentity);

        const tokenRes = await axios.post(`${baseURL}/get-token`, {
          username: user_name,
          role: "Broadcaster",
          identity: broadcasterIdentity,
          room: room_id,
        });

        if (tokenRes.data && tokenRes.data.token) {
          const livekitToken = tokenRes.data.token;
          setToken(livekitToken);
          setMessage("Live stream started and token received!");
          setTitle("");
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

      const localTracks = await createLocalTracks({
        audio: true,
        video: { deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined },
      });

      for (const track of localTracks) {
  await livekitRoom.localParticipant.publishTrack(track);
  if (track.kind === "video") currentVideoTrackRef.current = track;
  if (track.kind === "audio") currentAudioTrackRef.current = track;
}

      const videoTrack = localTracks.find((t) => t.kind === "video");
    if (videoTrack && localVideoRef.current) {
      localVideoRef.current.srcObject = new MediaStream([videoTrack.mediaStreamTrack]);
      localVideoRef.current.play();
    }

      setMessage("Connected to live room and streaming!");
    } catch (error) {
      console.error("LiveKit join error:", error);
      setMessage("Failed to connect to live stream.");
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
      deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined
    });
    await room.localParticipant.publishTrack(videoTrack);
    currentVideoTrackRef.current = videoTrack;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = new MediaStream([videoTrack.mediaStreamTrack]);
      localVideoRef.current.play();
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
    const audioTrack = await createLocalTracks({ audio: true });
    const micTrack = audioTrack.find((t) => t.kind === "audio");
    if (micTrack) {
      await room.localParticipant.publishTrack(micTrack);
      currentAudioTrackRef.current = micTrack;
    }
  }
  setIsMicOn(!isMicOn);
};


  const handleEndLive = async () => {
    const user_id = localStorage.getItem("user_id");

    // Add debugging
    console.log("Attempting to end live stream");
    console.log("Room Info:", roomInfo);
    console.log("User ID:", user_id);

    if (!roomInfo) {
      const errorMsg = "Cannot end stream: Room information is missing";
      console.error(errorMsg);
      setEndMessage(errorMsg);
      return;
    }

    if (!user_id) {
      const errorMsg = "Cannot end stream: User ID is missing";
      console.error(errorMsg);
      setEndMessage(errorMsg);
      return;
    }

    try {
      setMessage("Ending live stream..."); // Show processing message
      setEndMessage(""); // Clear previous messages

      const response = await axios.post(`${baseURL}/end-live`, {
        user_id: parseInt(user_id, 10), // Ensure it's an integer
        room_id: roomInfo.room_id,
        room_name: roomInfo.room_name,
      });

      console.log("End live response:", response.data);

      if (response.data.status) {
        setEndMessage(response.data.message || "Live stream ended successfully");
        setMessage("Live ended.");
      } else {
        const errorMsg = response.data.message || "Failed to end live stream";
        setEndMessage(errorMsg);
        console.error("End live API error:", errorMsg);
      }
    } catch (error) {
      console.error("End live error:", error);
      const errorMsg = "An error occurred while ending the live stream: " + (error.response?.data?.message || error.message);
      setEndMessage(errorMsg);
    } finally {
      // Clean up regardless of success or failure
      if (room) {
        room.disconnect();
        setRoom(null);
      }
      setToken(null);
      setRoomInfo(null);
      setTitle("");
    }
  };

  return (
    <div className="seller-dashboard">
      <h2>Seller Dashboard</h2>

      {token ? (
        <div className="livekit-video-container">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{ width: "600px", borderRadius: "12px" }}
          />
          <div className="button-row">
            {videoDevices.length > 1 && (
              <button onClick={switchCamera}>Switch Camera</button>
            )}
            <button onClick={toggleMic}>
              {isMicOn ? "Mute Mic" : "Unmute Mic"}
            </button>
            <button onClick={toggleCamera}>
              {isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
            </button>
            <button onClick={handleEndLive} disabled={loading}>
              {loading ? "Ending..." : "End Live"}
            </button>
          </div>
          {endMessage && <p className="end-message">{endMessage}</p>}
        </div>
      ) : (
        <>
          <div className="live-stream-form">
            <input
              type="text"
              placeholder="Enter live stream title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button onClick={handleStartLive} disabled={loading}>
              {loading ? "Starting..." : "Start Live"}
            </button>
          </div>
          {message && <p className="message">{message}</p>}
        </>
      )}
    </div>
  );
};

export default SellerDashboard;