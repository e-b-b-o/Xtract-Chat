const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware.js");
const Chat = require("../models/Chat.js");

// @desc    Get chat history
// @route   GET /api/chat/history
// @access  Private
router.get("/history", protect, async (req, res) => {
  try {
    let chat = await Chat.findOne({ user: req.user._id });

    if (!chat) {
      return res.status(200).json([]);
    }

    res.status(200).json(chat.messages);
  } catch (error) {
    console.error("Chat History Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @desc    Chat with AI (Streaming)
// @route   POST /api/chat/ask
// @access  Private
router.post("/ask", protect, async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ message: "Question is required" });
  }

  try {
    // Find or create chat document
    let chat = await Chat.findOne({ user: req.user._id });

    if (!chat) {
      chat = new Chat({ user: req.user._id, messages: [] });
    }

    // Get recent history (last 5 messages for context)
    const history = chat.messages.slice(-5).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Save user message immediately
    chat.messages.push({
      role: "user",
      content: question,
    });
    await chat.save();

    const pythonServiceUrl =
      process.env.PYTHON_SERVICE_URL || "http://localhost:5001";

    // Call Python RAG Service
    const ragResponse = await fetch(`${pythonServiceUrl}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: question,
        history: history,
      }),
    });

    if (!ragResponse.ok) {
      const errorData = await ragResponse.json();
      return res.status(ragResponse.status).json({
        message: "RAG Service Error",
        error: errorData.error || "Unknown error",
      });
    }

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const reader = ragResponse.body.getReader();
    const decoder = new TextDecoder();
    let fullAnswer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullAnswer += chunk.replace(/^data: /gm, "").replace(/\n\n$/gm, "");

      // Proxy the SSE chunk to client
      res.write(chunk);
    }

    // Save assistant response to DB after stream finishes
    if (fullAnswer) {
      chat.messages.push({
        role: "assistant",
        content: fullAnswer.trim(),
      });
      await chat.save();
    }

    res.end();
  } catch (error) {
    console.error("Chat Route Error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Server Error",
        error: error.message,
      });
    } else {
      res.write(`data: [ERROR]: ${error.message}\n\n`);
      res.end();
    }
  }
});

module.exports = router;
