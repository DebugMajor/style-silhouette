import OpenAI from "openai"

const client = new OpenAI({
apiKey:process.env.OPENAI_API_KEY
})

export const analyzeImage = async(req,res)=>{

try{

const response = await client.chat.completions.create({

model:"gpt-4o-mini",

messages:[

{
role:"system",
content:"You are an AI fashion stylist. Analyze outfits and give suggestions."
},

{
role:"user",
content:"The user uploaded an outfit photo. Give styling feedback."
}

]

})

res.json({

result:response.choices[0].message.content

})

}catch(err){

console.log(err)
res.status(500).json({error:"AI analysis failed"})

}

}