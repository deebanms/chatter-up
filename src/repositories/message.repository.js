import Message from "../models/message.model.js";

class MessageRepository {
  // Create a new message and save it to the database
  async createMessage(data) {
    const message = new Message(data); // Create a new message instance
    return await message.save(); // Save the message to the database
  }

  // Fetch all messages from the database, sorted by most recent first
  async getAllMessages() {
    return await Message.find().sort({ timestamp: -1 }); // Sort messages by timestamp in descending order
  }

  // Retrieve a specific message by its ID
  async getMessageById(id) {
    return await Message.findById(id); // Find a message by its ID
  }

  // Update an existing message by its ID with new data
  async updateMessage(id, data) {
    return await Message.findByIdAndUpdate(id, data, { new: true }); // Update the message and return the new version
  }

  // Delete a message by its ID
  async deleteMessage(id) {
    return await Message.findByIdAndDelete(id); // Remove the message from the database by ID
  }

  // Find all messages sent by a specific user, sorted by most recent first
  async findMessagesByUsername(username) {
    return await Message.find({ username }).sort({ timestamp: -1 }); // Find messages by username and sort them
  }
}

export default new MessageRepository(); // Exporting as a singleton instance
