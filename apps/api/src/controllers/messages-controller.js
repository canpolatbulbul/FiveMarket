import { query } from "../db/index.js";

/**
 * Get all conversations for the authenticated user
 * @access Private
 */
export const getConversations = async (req, res) => {
  try {
    const { decodeUserID } = await import("../utils/hashids.js");
    const user_id = decodeUserID(req.user.userID);

    const result = await query(
      `SELECT 
        c.conversation_id,
        c.order_id,
        c.created_at,
        c.updated_at,
        o.status as order_status,
        s.title as service_title,
        p.name as package_name,
        -- Get the other participant (client or freelancer)
        CASE 
          WHEN o.client_id = $1 THEN freelancer_user."userID"
          ELSE client_user."userID"
        END as other_user_id,
        CASE 
          WHEN o.client_id = $1 THEN freelancer_user.first_name
          ELSE client_user.first_name
        END as other_first_name,
        CASE 
          WHEN o.client_id = $1 THEN freelancer_user.last_name
          ELSE client_user.last_name
        END as other_last_name,
        CASE 
          WHEN o.client_id = $1 THEN 'freelancer'
          ELSE 'client'
        END as other_role,
        -- Get last message
        (
          SELECT json_build_object(
            'content', m.content,
            'sent_time', m.sent_time,
            'sender_user_id', m.sender_user_id,
            'seen_status', m.seen_status
          )
          FROM message m
          WHERE m.conversation_id = c.conversation_id
          ORDER BY m.message_no DESC
          LIMIT 1
        ) as last_message
       FROM conversation c
       JOIN "order" o ON c.order_id = o.order_id
       JOIN package p ON o.package_id = p.package_id
       JOIN service s ON p.service_id = s.service_id
       JOIN client cl ON o.client_id = cl."userID"
       JOIN "user" client_user ON cl."userID" = client_user."userID"
       JOIN freelancer f ON s.freelancer_id = f."userID"
       JOIN "user" freelancer_user ON f."userID" = freelancer_user."userID"
       WHERE o.client_id = $1 OR s.freelancer_id = $1
       ORDER BY c.updated_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      conversations: result.rows,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      error: "Failed to fetch conversations",
      message: error.message,
    });
  }
};

/**
 * Get conversation details with messages
 * @access Private (Client or Freelancer involved)
 */
export const getConversationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { decodeUserID } = await import("../utils/hashids.js");
    const user_id = decodeUserID(req.user.userID);

    // Get conversation with authorization check
    const convResult = await query(
      `SELECT 
        c.conversation_id,
        c.order_id,
        c.created_at,
        c.updated_at,
        o.client_id,
        o.status as order_status,
        o.total_price,
        s.freelancer_id,
        s.title as service_title,
        p.name as package_name,
        client_user."userID" as client_user_id,
        client_user.first_name as client_first_name,
        client_user.last_name as client_last_name,
        freelancer_user."userID" as freelancer_user_id,
        freelancer_user.first_name as freelancer_first_name,
        freelancer_user.last_name as freelancer_last_name
       FROM conversation c
       JOIN "order" o ON c.order_id = o.order_id
       JOIN package p ON o.package_id = p.package_id
       JOIN service s ON p.service_id = s.service_id
       JOIN client cl ON o.client_id = cl."userID"
       JOIN "user" client_user ON cl."userID" = client_user."userID"
       JOIN freelancer f ON s.freelancer_id = f."userID"
       JOIN "user" freelancer_user ON f."userID" = freelancer_user."userID"
       WHERE c.conversation_id = $1`,
      [id]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({
        error: "Conversation not found",
        message: "The requested conversation does not exist",
      });
    }

    const conversation = convResult.rows[0];
    const clientId = parseInt(conversation.client_id);
    const freelancerId = parseInt(conversation.freelancer_id);
    const userId = parseInt(user_id);

    // Authorization check
    if (clientId !== userId && freelancerId !== userId) {
      return res.status(403).json({
        error: "Access denied",
        message: "You do not have permission to view this conversation",
      });
    }

    // Get messages
    const messagesResult = await query(
      `SELECT 
        m.message_no,
        m.sender_user_id,
        m.content,
        m.sent_time,
        m.seen_status,
        u.first_name as sender_first_name,
        u.last_name as sender_last_name
       FROM message m
       JOIN "user" u ON m.sender_user_id = u."userID"
       WHERE m.conversation_id = $1
       ORDER BY m.message_no ASC`,
      [id]
    );

    // Determine user's role
    const userRole = clientId === userId ? "client" : "freelancer";

    res.json({
      success: true,
      conversation,
      messages: messagesResult.rows,
      userRole,
    });
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    res.status(500).json({
      error: "Failed to fetch conversation details",
      message: error.message,
    });
  }
};

/**
 * Send a message in a conversation
 * @access Private (Client or Freelancer involved)
 */
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const { decodeUserID } = await import("../utils/hashids.js");
    const user_id = decodeUserID(req.user.userID);

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: "Invalid message",
        message: "Message content cannot be empty",
      });
    }

    // Check authorization
    const convResult = await query(
      `SELECT o.client_id, s.freelancer_id
       FROM conversation c
       JOIN "order" o ON c.order_id = o.order_id
       JOIN package p ON o.package_id = p.package_id
       JOIN service s ON p.service_id = s.service_id
       WHERE c.conversation_id = $1`,
      [id]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({
        error: "Conversation not found",
        message: "The requested conversation does not exist",
      });
    }

    const { client_id, freelancer_id } = convResult.rows[0];
    const clientId = parseInt(client_id);
    const freelancerId = parseInt(freelancer_id);
    const userId = parseInt(user_id);

    if (clientId !== userId && freelancerId !== userId) {
      return res.status(403).json({
        error: "Access denied",
        message:
          "You do not have permission to send messages in this conversation",
      });
    }

    // Get next message number
    const messageNoResult = await query(
      `SELECT COALESCE(MAX(message_no), 0) + 1 as next_message_no
       FROM message
       WHERE conversation_id = $1`,
      [id]
    );

    const messageNo = messageNoResult.rows[0].next_message_no;

    // Insert message
    const result = await query(
      `INSERT INTO message (conversation_id, message_no, sender_user_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, messageNo, user_id, content.trim()]
    );

    // Update conversation updated_at
    await query(
      `UPDATE conversation SET updated_at = NOW() WHERE conversation_id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: result.rows[0],
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      error: "Failed to send message",
      message: error.message,
    });
  }
};
