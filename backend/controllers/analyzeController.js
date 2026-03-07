import axios from "axios"

export const analyzeOutfit = async (req,res)=>{

try{

const { image } = req.body

if(!image){
return res.status(400).json({ message:"No image provided" })
}

const base64Image = image.split(",")[1]

console.log("Sending image to Gemini 2.5 Flash...")

const response = await axios.post(
`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
{
contents:[
{
parts:[
{
text:`
Analyze the outfit in this image.

Return ONLY JSON:

{
"top":"",
"bottom":"",
"shoes":"",
"accessories":"",
"suggestions":[],
"styleScore":0
}

If clothing is unclear respond with:
"Clothing not fully visible"
`
},
{
inline_data:{
mime_type:"image/jpeg",
data:base64Image
}
}
]
}
]
}
)

let text = response.data.candidates[0].content.parts[0].text

// remove markdown if model returns ```json
text = text.replace(/```json/g,"").replace(/```/g,"").trim()

const result = JSON.parse(text)

res.json(result)

}catch(error){

console.log("AI ERROR:", error.response?.data || error)

res.status(500).json({
message:"AI analysis failed"
})

}

}