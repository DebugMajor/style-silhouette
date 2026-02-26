exports.handleUpload = (req, res) => {

  const messages = [
    "You look amazing 🔥",
    "That outfit suits you perfectly!",
    "Try pairing this with dark jeans.",
    "Great choice! Very stylish.",
    "You’re rocking this look!"
  ];

  const randomMessage =
    messages[Math.floor(Math.random() * messages.length)];

  res.json({
    message: randomMessage
  });
};