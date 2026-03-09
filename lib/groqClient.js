export async function askGroq(messages){

const key = process.env.GROQ_API_KEY

const res = await fetch(
"https://api.groq.com/openai/v1/chat/completions",
{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${key}`
},
body:JSON.stringify({
model:"qwen-qwq-32b",
messages
})
})

const data = await res.json()

return data.choices[0].message.content

}
