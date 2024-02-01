import { Cast } from "@/farcaster/cast";
import { FrameSignaturePacket } from "@/farcaster/frame-signature-packet";
import { frame200Response } from "@/farcaster/response";
import { USER_DATA_TYPE, UserData } from "@/farcaster/user";
import { time } from "console";
import { NextRequest, NextResponse } from "next/server";

// Host
const HOST_URL = process.env["HOST"];
// const HOST_URL = "https://5d3a-119-18-20-120.ngrok-free.app"

// Frame Contents
const title = "dont";
const frameVersion = "vNext";

// Farcaster API
const HUBBLE_URL = "https://nemes.farcaster.xyz:2281/v1";
const FID = 3

function TitleFrame()
{
    const buttonNames = ["↩️", "▶️"];
    const postUrl = HOST_URL + `/api/dont`;
    const frameImageUrl = HOST_URL + `/title.png`;
    return frame200Response(
        title,
        frameVersion,
        frameImageUrl,
        postUrl,
        buttonNames
    );
}

function NoCastsFrame()
{
    const buttonNames = ["↩️"];
    const postUrl = HOST_URL + `/api/dont?reset=true`;
    const frameImageUrl = HOST_URL + `/no-donts.png`;
    return frame200Response(
        title,
        frameVersion,
        frameImageUrl,
        postUrl,
        buttonNames
    );
}

// Handle GET
export function GET()
{
    return TitleFrame()
}

// Handle POST
export async function POST(req: NextRequest, res: NextResponse)
{
    console.log("POST")
    // Query string
    const searchParams = req.nextUrl.searchParams;
    let indexString = searchParams.get("index");
    let reset = searchParams.get("reset")

    // JSON data
    const data: FrameSignaturePacket = await req.json()
    const btnIndex = data.untrustedData.buttonIndex;
    if (indexString == "0" && btnIndex == 1 || reset == "true") {
        return TitleFrame()
    }
    const buttonNames = ["⏮️", "⏭️"]
    let chain = searchParams.get("chain")

    // POST
    // TODO: Check if we're at the end of prev chain
    // Assumeing index == Chain.menu.length - 1
    // Assuming chain=early; we should query the buttonIndex to find
    // which chain to navigate to here

    // TODO: Check the query string for fid and hash
    // const FRAME_FID = process.env["FID_ZERO"];
    // const FRAME_HASH = process.env["HASH_ZERO"];

    // Grab casts
    const response = await fetch(
        `${HUBBLE_URL}/castsByFid?fid=${FID}&pageSize=500&reverse=1`
    );
    const { messages } = await response.json();
    const casts: Cast[] = messages;
    // DEBUG
    console.log(`casts.length: ${casts.length}`);

    // Filter replies for don't do this
    const filteredCasts = casts.filter(c=>c.data != undefined && c.data.castAddBody != undefined).filter(
        (c) => {
            if (c.data.castAddBody.text == "")
            {
                return false
            }
            const txt = c.data.castAddBody.text.toLowerCase()
            return txt.includes("dont do this") || txt.includes("don't do this")
        }
    );
    // DEBUG
    console.log(`filteredCasts.length: ${filteredCasts.length}`);

    // If no casts found
    if (filteredCasts.length == 0)
    {
        return NoCastsFrame()
    }

    const total = filteredCasts.length;

    // Select reply to show
    // FIX: select using buttonIndex and res.query
    console.log(`btnIndex: ${btnIndex}`);
    console.log(`indexString: ${indexString}`);
    let index: number = 0
    if (!indexString) {
        index = 0;
    } else if (btnIndex == 2) {
        console.log("IF2");
        index = +indexString + 1;
    } else if (btnIndex == 1) {
        console.log("IF2");
        index = +indexString - 1;
    }

    // chain = "early";
    console.log(`index: ${index!}`);
    const cast = filteredCasts[index];
    console.log(`cast: ${cast}`)
    const timestamp = cast.data.timestamp
    console.log(`timestamp: ${timestamp}`)
    const img = cast.data.castAddBody.embeds[0].url;
    const usernameRes = await fetch(
        `${HUBBLE_URL}/userDataByFid?fid=${FID}&user_data_type=${USER_DATA_TYPE.USERNAME}`
    );
    const usernameData: UserData = await usernameRes.json();
    const username = usernameData.data.userDataBody.value;
    const pfpRes = await fetch(
        `${HUBBLE_URL}/userDataByFid?fid=${FID}&user_data_type=${USER_DATA_TYPE.PFP}`
    );
    const pfpData: UserData = await pfpRes.json();
    const pfp = pfpData.data.userDataBody.value;

    const frameImageUrl =
        HOST_URL +
        `/api/image/dont?timestamp=${timestamp}&img=${img}&username=${username}&pfp=${pfp}&index=${index}&total=${total}&date=${Date.now()}`;
    const postUrl =
        HOST_URL +
        `/api/dont?index=${index}`;
    return frame200Response(title, frameVersion, frameImageUrl, postUrl, buttonNames)
}

// export default async function handler(
//     req: NextApiRequest,
//     res: NextApiResponse
// ) {
//     // Example menu
//     const FRAME_FID = 3;
//     const btnIndex = +req.body?.untrustedData?.buttonIndex ?? 0;
//     const HOST_URL = process.env["HOST"];
//     res.setHeader("Content-Type", "text/html");
//     let frameImage;
//     // FIXME: please
//     if (req.method == "GET" || (+req.query["index"] == 0 && btnIndex == 1)) {
//         // Grab cast
//         const usernameRes = await fetch(
//             `${HUBBLE_URL}/userDataByFid?fid=${FRAME_FID}&user_data_type=${USER_DATA_TYPE.USERNAME}`
//         );
//         const usernameData: UserData = await usernameRes.json();
//         const username = usernameData.data.userDataBody.value;
//         const pfpRes = await fetch(
//             `${HUBBLE_URL}/userDataByFid?fid=${FRAME_FID}&user_data_type=${USER_DATA_TYPE.PFP}`
//         );
//         const pfpData: UserData = await pfpRes.json();
//         const pfp = pfpData.data.userDataBody.value;

//         frameImage = HOST_URL + `/api/dont-get?&pfp=${pfp}&username=${username}&date=${Date.now()}`;
//         // Return 200 response
//         let post_url = HOST_URL + "/api/dont";
//         return res.status(200).send(`
//             <!DOCTYPE html> 
//             <html>
//             <head>
//                 <title>${title}</title>
//                 <meta property="og:title" content="${title}" />
//                 <meta property="og:description" content="${title}" />
//                 <meta
//                 property="og:image"
//                 content="${frameImage}"
//                 />
//                 <meta name="fc:frame" content="${frameVersion}" />
//                 <meta name="fc:frame:image" 
//                     content="${frameImage}"
//                 />
//                 <meta name="fc:frame:post_url"
//                     content="${post_url}?chain=menu&index=0"
//                 />
//                 <meta name="fc:frame:button:1" content="↩️" />
//                 <meta name="fc:frame:button:2" content="▶️" />
//             </head>
//             <body><p>yo</p></body>
//             </html>
//         `);
//     }
//     let chain = req.query["chain"];
//     let index = +req.query["index"];
//     // POST
//     // TODO: Check if we're at the end of prev chain
//     // Assumeing index == Chain.menu.length - 1
//     // Assuming chain=early; we should query the buttonIndex to find
//     // which chain to navigate to here

//     // TODO: Check the query string for fid and hash
//     // const FRAME_FID = process.env["FID_ZERO"];
//     // const FRAME_HASH = process.env["HASH_ZERO"];

//     // Grab casts
//     const response = await fetch(
//         `${HUBBLE_URL}/castsByFid?fid=${FRAME_FID}&pageSize=500&reverse=1`
//     );
//     const { messages } = await response.json();
//     const casts: Cast[] = messages;
//     console.log(`casts.length: ${casts.length}`);

//     // Filter replies for don't do this
//     const filteredCasts = casts.filter(c=>c.data != undefined && c.data.castAddBody != undefined).filter(
//         (c) => {
//             if (c.data.castAddBody.text == "")
//             {
//                 return false
//             }
//             const txt = c.data.castAddBody.text.toLowerCase()
//             return txt.includes("dont do this") || txt.includes("don't do this")
//         }
//     );
//     // If no casts found
//     if (filteredCasts.length == 0)
//     {
//         let post_url = HOST_URL + "/api/dont";
//         return res.status(200).send(`
//             <!DOCTYPE html> 
//             <html>
//             <head>
//                 <title>${title}</title>
//                 <meta property="og:title" content="${title}" />
//                 <meta property="og:description" content="${title}" />
//                 <meta
//                 property="og:image"
//                 content="${frameImage}"
//                 />
//                 <meta name="fc:frame" content="${frameVersion}" />
//                 <meta name="fc:frame:image" 
//                     content="${frameImage}"
//                 />
//                 <meta name="fc:frame:post_url"
//                     content="${post_url}?chain=menu&index=0"
//                 />
//                 <meta name="fc:frame:button:1" content="↩️" />
//                 <meta name="fc:frame:button:2" content="▶️" />
//             </head>
//             <body><p>yo</p></body>
//             </html>
//         `);
//     }
//     console.log(`filteredCasts.length: ${filteredCasts.length}`);
//     const total = filteredCasts.length;

//     // Select reply to show
//     // FIX: select using buttonIndex and res.query
//     const curIndex = req.query["index"];
//     console.log(`btnIndex: ${btnIndex}`);
//     console.log(`curIndex: ${curIndex}`);
//     if (chain != "early") {
//         index = 0;
//     } else if (btnIndex == 2) {
//         console.log("IF2");
//         index += 1;
//     } else if (btnIndex == 1) {
//         console.log("IF2");
//         index -= 1;
//     }
//     chain = "early";
//     console.log(`index: ${index}`);
//     const cast = filteredCasts[index];
//     console.log(`cast: ${cast}`)
//     const img = cast.data.castAddBody.embeds[0].url;
//     const usernameRes = await fetch(
//         `${HUBBLE_URL}/userDataByFid?fid=${FRAME_FID}&user_data_type=${USER_DATA_TYPE.USERNAME}`
//     );
//     const usernameData: UserData = await usernameRes.json();
//     const username = usernameData.data.userDataBody.value;
//     const pfpRes = await fetch(
//         `${HUBBLE_URL}/userDataByFid?fid=${FRAME_FID}&user_data_type=${USER_DATA_TYPE.PFP}`
//     );
//     const pfpData: UserData = await pfpRes.json();
//     const pfp = pfpData.data.userDataBody.value;
//     // Create frame image
//     frameImage =
//         HOST_URL +
//         `/api/chain-node?img=${img}&username=${username}&pfp=${pfp}&index=${index}&total=${total}&date=${Date.now()}`;
//     const post_url =
//         HOST_URL +
//         `/api/dont?chain=${chain}&index=${index}`;

//     // Return 200 response
//     return res.status(200).send(`
//             <!DOCTYPE html> 
//             <html>
//               <head>
//                 <title>${title}</title>
//                 <meta property="og:title" content="${title}" />
//                 <meta property="og:description" content="${title}" />
//                 <meta property="og:image" content="${frameImage}" />
//                 <meta name="fc:frame" content="${frameVersion}" />
//                 <meta name="fc:frame:image" content="${frameImage}" />
//                 <meta name="fc:frame:post_url" content="${post_url}" />
//                 <meta name="fc:frame:button:1" content=".prev" />
//                 ${
//                     index == total - 1
//                         ? null
//                         : `<meta name="fc:frame:button:2" content=".next" />`
//                 }
//               </head>
//               <body><p>yo</p></body>
//             </html>
//         `);
// }
