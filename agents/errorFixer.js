import {askGroq} from "../lib/groqClient.js"

export async function fixError(code,error){

const prompt=`
Code:

${code}

Error:

${error}

Fix the issue.
`

return await askGroq([
{role:"system",content:"You are a debugging expert."},
{role:"user",content:prompt}
])

}
