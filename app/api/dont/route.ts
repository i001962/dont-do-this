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
const title = "Bannyverse";
const frameVersion = "vNext";

// Farcaster API
const HUBBLE_URL = "https://nemes.farcaster.xyz:2281/v1";
const FID = 4163;

function TitleFrame()
{
    const buttonNames = ["↩️", "▶️"];
    const postUrl = HOST_URL + `/api/dont`;
    const frameImageUrl = HOST_URL + `/banny1.png`;
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
    const frameImageUrl = HOST_URL + `/banny2.png`;
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
    if (indexString == "0" && btnIndex == 1 || btnIndex == 1 && indexString == null || reset == "true") {
        return TitleFrame()
    }
    // let chain = searchParams.get("chain")

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
    const buttonNames = index != total - 1 ? ["⏮️", "⏭️"] : ["⏮️"]

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

