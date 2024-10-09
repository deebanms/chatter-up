document.addEventListener("DOMContentLoaded", () => {
  const popUpModal = document.getElementById("popup-modal");
  const joinChatForm = document.getElementById("user-info-form");
  const usernameInput = document.getElementById("username");
  const messageInput = document.querySelector(".chat-footer input");
  const sendButton = document.querySelector(".chat-footer button");
  const typingIndicator = document.getElementById("typing-user");
  const userContainer = document.getElementById("user-container");

  //let username;
  //display pop up modal
  popUpModal.style.display = "block";
  const socket = io();

  // Handle user joining the chat
  joinChatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = usernameInput.value; // Get the username from the input field

    // Emit the username without a profile picture
    socket.emit("joinChat", { username });

    // Update the UI and close the modal
    document.getElementById("popup-modal").classList.remove("active");
    document.querySelector(".username").innerText = username;
    popUpModal.style.display = "none";
  });

  // Listen for chat history
  socket.on("chatHistory", (messages) => {
    const socketUser = messages.socketUser;
    const chatMessages = messages.messages;
    // Iterate over the messages array and display each message in the chat UI
    console.log(chatMessages);
    chatMessages.forEach((message) => {
      console.log(message.username, socketUser);
      if (message.messageType == "notification") {
        createNotification(message);
      } else if (message.username.toLowerCase() === socketUser.toLowerCase()) {
        createMessage(message, true);
      } else {
        createMessage(message, false);
      }
    });
  });

  socket.on("updateUserList", (userList) => {
    // Update the UI to reflect the current users in the chat
    console.log("Updated user list:", userList);
    // Logic to refresh user list in the UI
    generateOnlineMembers(userList, userContainer);
  });

  // Listen for new messages
  socket.on("chatMessage", (message) => {
    console.log(socket);
    const socketUser = message.socketUser;
    const chatMessages = message.messages;
    console.log(message);

    console.log(chatMessages.username, socketUser);
    if (chatMessages.messageType == "notification") {
      createNotification(chatMessages);
    } else if (
      chatMessages.username.toLowerCase() === socketUser.toLowerCase()
    ) {
      createMessage(chatMessages, true);
    } else {
      createMessage(chatMessages, false);
    }
  });

  //Listen for send Messages
  socket.on("sendMessage", (message) => {
    const socketId = message.socketId;
    const chatMessages = message.messages;
    if (socketId == socket.id) {
      createMessage(chatMessages, true);
      audioNotification();
    } else {
      createMessage(chatMessages, false);
      audioNotification("receive");
    }
  });

  // Listen for typing indicator updates
  socket.on("displayTyping", (typingUsers) => {
    typingIndicator.innerText = `${typingUsers} typing...`;
    typingIndicator.style.display = "inline-block";
    setTimeout(() => {
      typingIndicator.style.display = "none";
    }, 2000);
  });

  // Handle sending a message
  sendButton.addEventListener("click", () => {
    const message = messageInput.value;
    if (message) {
      socket.emit("sendMessage", message);
      messageInput.value = ""; // Clear input
    }
  });

  // Handle typing indicator
  messageInput.addEventListener("input", (e) => {
    if (e.target.value.length > 0) {
      socket.emit("typing", messageInput.value.length > 0);
    }
  });
});

//function to create chat messages
function createMessage(message, isUser = false) {
  const messageContainer = document.querySelector(".chat-messages");
  const messageElement = document.createElement("div");
  messageElement.classList.add(
    "chat-message",
    isUser ? "user-message" : "sender-message"
  );

  // Create profile picture element
  const profilePicHTML = `<img src="/images/profile/child.webp" class="profile-pic" loading="lazy" />`;

  // Create message content
  const messageContent = `
    <div class="message-content-header">
      <span class="message-username">${isUser ? "You" : message.username}</span>
      <span class="message-time">${convertTime(message.timestamp)}</span>
    </div>
    <p class="message-text">${message.content}</p>
  `;

  // Set the inner HTML of the message element
  messageElement.innerHTML = isUser
    ? `<div class="message-content">${messageContent}</div>${profilePicHTML}`
    : `${profilePicHTML}<div class="message-content">${messageContent}</div>`;

  // Append the message element to the container
  messageContainer.appendChild(messageElement);

  // Scroll to the bottom of the message container
  scrollToBottom(messageContainer);
}

// function to chat notification for join and leave
function createNotification(message) {
  const messageContainer = document.querySelector(".chat-messages");
  const notificationElement = document.createElement("div");
  notificationElement.classList.add("chat-notifications");
  notificationElement.innerHTML = `<span class="notification-text">${message.content}</span>`;
  messageContainer.appendChild(notificationElement);
  // Scroll to bottom after adding a notification
  scrollToBottom(messageContainer);
}

//scroll to bottom function
function scrollToBottom(container) {
  container.scrollTop = container.scrollHeight;
}

//Online member section
function generateOnlineMembers(users, userContainer) {
  const memberCount = users.length || 0;
  userContainer.innerHTML = ""; // Clear previous user list

  // Create header for online users count
  const onlineContainerHeader = document.createElement("div");
  onlineContainerHeader.classList.add("online-users-container-header");
  onlineContainerHeader.innerHTML = `Connected Users: <span class="online-user-count">${memberCount}</span>`;
  userContainer.appendChild(onlineContainerHeader);

  // Loop through the users and create a div for each online member
  users.forEach((user) => {
    const onlineMember = document.createElement("div");
    onlineMember.classList.add("online-member");
    onlineMember.innerHTML = `
      <span class="online-indicator"></span>
      <span class="online-member-name">${user}</span>`; // Assuming user object has a username property
    userContainer.appendChild(onlineMember);
  });
}

//convert time function
function convertTime(dateString) {
  const date = new Date(dateString); // Create a Date object from the input string

  // Add 5 hours and 30 minutes to convert UTC to IST
  date.setHours(date.getUTCHours() + 5);
  date.setMinutes(date.getUTCMinutes() + 30);

  // Extract hours and minutes for IST
  let hours = date.getHours() % 12 || 12; // Convert to 12-hour format
  const minutes = String(date.getMinutes()).padStart(2, "0"); // Format minutes

  // Determine AM/PM suffix
  const amPm = date.getHours() >= 12 ? "PM" : "AM";

  // Construct and return the final formatted time string
  return `${hours}:${minutes} ${amPm}`;
}

// audio notification funnction
function audioNotification(type = "send") {
  const filePath = type === "send" ? "/sound/send.mp3" : "/sound/receive.wav";
  const notificationSound = new Audio(filePath);
  notificationSound.play().catch((error) => {
    // Handle any playback errors (e.g., if the user hasn't interacted with the page)
    console.error("Error playing sound:", error);
  });
}
