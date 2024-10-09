import messageRepository from "../repositories/message.repository.js";

class MessageService {
  // Create a new message and save it in the repository
  async createMessage(data) {
    // Validate that username and content are present
    if (!data.username || !data.content) {
      throw new Error("Username and content are required");
    }

    // Save the message using the repository
    const message = await messageRepository.createMessage(data);
    // Broadcast the message to all connected clients (handled in the controller)
    return message;
  }

  // Fetch all messages from the repository
  async getAllMessages() {
    return await messageRepository.getAllMessages();
  }

  // Retrieve a specific message by its ID
  async getMessageById(id) {
    const message = await messageRepository.getMessageById(id);
    if (!message) {
      throw new Error("Message not found"); // Error if no message is found
    }
    return message;
  }

  // Update a message by its ID and new data
  async updateMessage(id, data) {
    const message = await messageRepository.updateMessage(id, data);
    if (!message) {
      throw new Error("Message not found or update failed"); // Error if the message does not exist or the update fails
    }
    return message;
  }

  // Delete a message by its ID
  async deleteMessage(id) {
    const message = await messageRepository.deleteMessage(id);
    if (!message) {
      throw new Error("Message not found or delete failed"); // Error if the message does not exist or the deletion fails
    }
    return message;
  }

  // Find all messages sent by a specific user
  async findMessagesByUsername(username) {
    return await messageRepository.findMessagesByUsername(username);
  }
}

export default new MessageService(); // Exporting as a singleton instance
