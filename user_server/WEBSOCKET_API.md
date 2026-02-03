# Real-Time Seat Matrix WebSocket API

## Overview

The seat matrix is now available via WebSocket for real-time updates. Clients will automatically receive seat availability updates whenever:

- A user locks seats
- A user unlocks seats (by changing selection)
- A booking is confirmed
- Seat locks expire (every 30 seconds)

## WebSocket Configuration

### Connection Endpoint

```
ws://localhost:8080/ws
```

With SockJS fallback support for browsers that don't support WebSocket.

## How to Connect

### Using JavaScript (SockJS + STOMP)

```javascript
// 1. Include required libraries
// <script src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js"></script>

// 2. Connect to WebSocket
const socket = new SockJS("http://localhost:8080/ws");
const stompClient = Stomp.over(socket);

// 3. Connect and subscribe to seat matrix updates for a specific trip
const tripId = 123; // Replace with actual trip ID

stompClient.connect({}, function (frame) {
	console.log("Connected: " + frame);

	// Subscribe to seat matrix updates for this trip
	stompClient.subscribe("/topic/seat-matrix/" + tripId, function (message) {
		const seatMatrix = JSON.parse(message.body);
		console.log("Received seat matrix update:", seatMatrix);

		// Update your UI with the new seat matrix
		updateSeatMatrixUI(seatMatrix);
	});

	// Request initial seat matrix
	stompClient.send("/socket/seat-matrix/" + tripId, {}, "{}");
});

// 4. Handle disconnection
function disconnect() {
	if (stompClient !== null) {
		stompClient.disconnect();
	}
	console.log("Disconnected");
}

// 5. Update UI function (example)
function updateSeatMatrixUI(seatMatrix) {
	// seatMatrix is a 2D array of seats
	// Example structure:
	// [
	//   [ {seatNumber: "A1", isBooked: false, lockOwner: null, lockedUntil: null}, ... ],
	//   [ {seatNumber: "B1", isBooked: true, lockOwner: 5, lockedUntil: "2026-02-02T10:30:00"}, ... ],
	//   ...
	// ]

	seatMatrix.forEach((row, rowIndex) => {
		row.forEach((seat, colIndex) => {
			const seatElement = document.getElementById(seat.seatNumber);

			if (seat.isBooked) {
				seatElement.className = "seat booked";
				seatElement.disabled = true;
			} else if (seat.lockOwner) {
				seatElement.className = "seat locked";
				seatElement.disabled = true;
			} else {
				seatElement.className = "seat available";
				seatElement.disabled = false;
			}
		});
	});
}
```

### Using React

```javascript
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { useEffect, useState } from "react";

function SeatMatrix({ tripId }) {
	const [seatMatrix, setSeatMatrix] = useState([]);
	const [stompClient, setStompClient] = useState(null);

	useEffect(() => {
		// Connect to WebSocket
		const socket = new SockJS("http://localhost:8080/ws");
		const client = Stomp.over(socket);

		client.connect({}, (frame) => {
			console.log("Connected:", frame);

			// Subscribe to updates
			client.subscribe(`/topic/seat-matrix/${tripId}`, (message) => {
				const matrix = JSON.parse(message.body);
				setSeatMatrix(matrix);
			});

			// Request initial data
			client.send(`/socket/seat-matrix/${tripId}`, {}, "{}");
		});

		setStompClient(client);

		// Cleanup on unmount
		return () => {
			if (client) {
				client.disconnect();
			}
		};
	}, [tripId]);

	return (
		<div className="seat-matrix">
			{seatMatrix.map((row, rowIndex) => (
				<div key={rowIndex} className="seat-row">
					{row.map((seat, colIndex) => (
						<button
							key={seat.seatNumber}
							className={`seat ${
								seat.isBooked
									? "booked"
									: seat.lockOwner
										? "locked"
										: "available"
							}`}
							disabled={seat.isBooked || seat.lockOwner}>
							{seat.seatNumber}
						</button>
					))}
				</div>
			))}
		</div>
	);
}
```

## REST API Fallback

If you need to get the seat matrix without WebSocket (for initial load or fallback), you can still use the REST endpoint:

```
GET /user/trips/{tripId}/seat-matrix
```

**Response:**

```json
[
  [
    {
      "seatNumber": "A1",
      "isBooked": false,
      "lockOwner": null,
      "lockedUntil": null
    },
    {
      "seatNumber": "A2",
      "isBooked": true,
      "lockOwner": null,
      "lockedUntil": null
    },
    ...
  ],
  ...
]
```

## Seat Status Indicators

Each seat object has the following properties:

- **seatNumber**: String (e.g., "A1", "B2")
- **isBooked**: Boolean - `true` if seat is confirmed/booked
- **lockOwner**: Long - User ID who has locked the seat (null if not locked)
- **lockedUntil**: LocalDateTime - When the lock expires (null if not locked)

### Determining Seat Status:

1. **Booked**: `isBooked === true`
2. **Locked by current user**: `lockOwner === currentUserId`
3. **Locked by another user**: `lockOwner !== null && lockOwner !== currentUserId`
4. **Available**: `!isBooked && lockOwner === null`

## Message Flow

### Client → Server

```
Destination: /socket/seat-matrix/{tripId}
Body: {} (empty object)
```

### Server → Client

```
Topic: /topic/seat-matrix/{tripId}
Body: 2D array of seat objects
```

## Testing with STOMP CLI

You can test the WebSocket connection using a STOMP client:

```bash
# Install STOMP CLI
npm install -g stompjs

# Connect and subscribe
stomp connect ws://localhost:8080/ws
> subscribe /topic/seat-matrix/1
> send /socket/seat-matrix/1 {}
```

## Important Notes

1. **Auto-Updates**: Once subscribed, you'll automatically receive updates whenever seats change - no need to poll!
2. **Multiple Clients**: All clients subscribed to the same trip will receive updates simultaneously
3. **Lock Expiry**: Every 30 seconds, expired locks are cleared and updates are broadcast
4. **Connection Management**: Make sure to disconnect when the user navigates away to free resources

## CORS Configuration

If you're connecting from a different origin, ensure your WebSocket config allows it:

```java
registry.addEndpoint("/ws")
    .setAllowedOrigins("*") // Already configured
    .withSockJS();
```

## NPM Packages Needed

For web clients:

```bash
npm install sockjs-client
npm install stompjs
# or for React
npm install @stomp/stompjs
```

## Example User Flow

1. User opens trip details page
2. Client connects to WebSocket: `ws://localhost:8080/ws`
3. Client subscribes to: `/topic/seat-matrix/{tripId}`
4. Client requests initial data: Send to `/socket/seat-matrix/{tripId}`
5. Server sends current seat matrix
6. User A locks seats → Server broadcasts update to all clients
7. User B sees seats become unavailable in real-time
8. User A confirms booking → Server broadcasts update
9. All clients see seats change to booked status
10. Lock expires → Server broadcasts update automatically

---

**Backend Implementation:**

- WebSocket Controller: [SeatMatrixWebSocketController.java](src/main/java/com/zytra/user_server/trips/controller/SeatMatrixWebSocketController.java)
- Broadcast Service: [SeatMatrixBroadcastService.java](src/main/java/com/zytra/user_server/trips/service/SeatMatrixBroadcastService.java)
- WebSocket Config: [WebSocketConfig.java](src/main/java/com/zytra/user_server/config/WebSocketConfig.java)
