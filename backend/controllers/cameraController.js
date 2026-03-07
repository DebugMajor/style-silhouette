export const handleUpload = (req,res)=>{

const responses = [
"You look amazing 🔥",
"That outfit suits you perfectly!",
"Try pairing this with dark jeans.",
"Great choice! Very stylish.",
"You’re rocking this look!"
];

const random = responses[Math.floor(Math.random()*responses.length)];

res.json({
message:random
});

};