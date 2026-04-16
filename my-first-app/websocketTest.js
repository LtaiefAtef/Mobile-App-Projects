const { Client } = require('@stomp/stompjs');
const WebSocket = require('ws');

// Create STOMP client
const client = new Client({
  webSocketFactory: () => new WebSocket('ws://localhost:8081/ws'),
  debug: (str) => console.log(str),

  reconnectDelay: 5000,

  onConnect: () => {
    console.log("Connected to WebSocket");

    // Subscribe to topic
    client.subscribe('/topic/messages', (message) => {
      console.log("Received:", message.body);
    });

    // Send a message to backend
    client.publish({
      destination: '/app/chat',
      body: JSON.stringify({ text: "Hello from Node.js" })
    });

    console.log("Message sent");
  },

  onStompError: (frame) => {
    console.error("Broker error:", frame.headers['message']);
  },

  onWebSocketError: (error) => {
    console.error("WebSocket error:", error);
  }
});

// Activate connection
client.activate();