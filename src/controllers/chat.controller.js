import messageService from "../services/message.service.js";

class ChatController {
  constructor(io) {
    this.io = io;
    this.users = {}; // Store connected users
    this.messages = []; // Local messages store for chat history
    this.initialize();
  }

  initialize() {
    this.setupSocketIO(); // Set up Socket.IO connections and events
  }

  setupSocketIO() {
    this.io.on("connection", (socket) => {
      console.log("New user connected:", socket.id); // Log when a new user connects

      // Handle user joining the chat
      socket.on("joinChat", (data) => this.handleUserJoined(socket, data));

      // Handle user sending a message
      socket.on("sendMessage", (messageContent) =>
        this.handleSendMessage(socket, messageContent)
      );

      // Handle typing indicator for users
      socket.on("typing", () => this.handleTyping(socket));

      // Handle user disconnecting from chat
      socket.on("disconnect", () => this.handleUserDisconnect(socket));
    });
  }

  async handleUserJoined(socket, data) {
    const { username } = data;
    this.users[socket.id] = username; // Add the new user to the user list

    // Fetch and send chat history to the new user
    await this.handleFetchMessages(socket);

    // Send a notification message to all users that the user joined
    const joinMessage = await this.notificationMessage(username, "joined");
    this.messages.push(joinMessage); // Add the join message to the local message store
    this.io.emit("chatMessage", {
      messages: joinMessage,
      socketUser: username,
    }); // Broadcast the join message
    this.io.emit("updateUserList", Object.values(this.users)); // Update the user list for all clients
  }

  async notificationMessage(username, type) {
    // Create a notification message (e.g., "User has joined/left the chat")
    const message = {
      username: "ChatterUp", // System-generated message
      content: `${username} has ${type} the chat!`, // Dynamic content for join/leave
      messageType: "notification", // Message type is notification
    };
    return await messageService.createMessage(message); // Save the message using message service
  }

  async handleSendMessage(socket, messageContent) {
    const username = this.users[socket.id]; // Get the username of the sender
    console.log(username); // Log the username
    const messageData = { username, content: messageContent }; // Create a message object

    try {
      const savedMessage = await messageService.createMessage(messageData); // Save the message using the service
      this.messages.push(savedMessage); // Store it locally
      this.io.emit("sendMessage", {
        messages: savedMessage,
        socketId: socket.id,
      }); // Broadcast the new message to all users
    } catch (error) {
      console.error("Error sending message:", error); // Log error
      socket.emit("messageError", "Could not send message."); // Notify the user if the message could not be sent
    }
  }

  handleTyping(socket) {
    // Broadcast the typing indicator to all other users
    socket.broadcast.emit("displayTyping", this.users[socket.id]);
  }

  async handleUserDisconnect(socket) {
    const username = this.users[socket.id]; // Get the username of the disconnecting user
    if (username) {
      try {
        const leaveMessage = await this.notificationMessage(username, "left"); // Create a leave notification
        this.messages.push(leaveMessage); // Add the leave message to the message store
        delete this.users[socket.id]; // Remove the user from the user list
        this.io.emit("chatMessage", {
          messages: leaveMessage,
          socketUser: username,
        }); // Broadcast the leave message
        this.io.emit("updateUserList", Object.values(this.users)); // Update the user list for all clients
      } catch (error) {
        console.error("Error handling user disconnect:", error); // Log any error during disconnect handling
      }
    }
  }

  async handleFetchMessages(socket) {
    try {
      const username = this.users[socket.id]; // Get the username for the requesting user
      const messages = (await messageService.getAllMessages()).sort(); // Fetch and sort all messages from the service
      this.messages = messages; // Update local message store with fetched messages
      socket.emit("chatHistory", { messages, socketUser: username }); // Send chat history to the user
    } catch (error) {
      console.error("Error fetching messages:", error); // Log any error during message fetch
    }
  }
}

export default ChatController;
