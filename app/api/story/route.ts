import { Cast } from "@/farcaster/cast";
import { FrameSignaturePacket } from "@/farcaster/frame-signature-packet";
import { frame200Response } from "@/farcaster/response";
import { USER_DATA_TYPE, UserData } from "@/farcaster/user";
import { time } from "console";
import { NextRequest, NextResponse } from "next/server";
/* GUNDB */
import Gun from 'gun';
// import sea from 'gun/sea';
import 'gun/lib/radix';
import 'gun/lib/radisk';
import 'gun/lib/store';
import 'gun/lib/rindexed';

const GunPeers = ['https://gun-manhattan.herokuapp.com/gun']; // TODO: add more peers in const.ts
const peers = GunPeers; 
const gun = Gun({
  peers: peers,
  localStorage: true, 
  radisk: false, // Use Radisk to persist data
}); 
const locations = gun.get('test-locations-1').get("user");

// Host
//const HOST_URL = process.env["HOST"];
const HOST_URL = "https://bannyverse.vercel.app"

// Frame Contents
const title = "Bannyverse";
const frameVersion = "vNext";

// Farcaster API
const HUBBLE_URL = "https://nemes.farcaster.xyz:2281/v1";
const FID = 4163; //4970;

function TitleFrame()
{
    const buttonNames = ["↩️", "▶️"];
    const postUrl = HOST_URL + `/api/story`;
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
    const postUrl = HOST_URL + `/api/story?reset=true`;
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
    const ipAddress = req.headers.get('x-forwarded-for') || undefined;
    //console.log(`ipAddress: ${ipAddress}`);
    locations.get('test').put(ipAddress);

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

    // Grabs croptop posts
    const res1 = await fetch('https://banny.eth.limo/rss.xml');
    const data1 = await res1.text();
      console.log(data1);
      const srcAttributes: string[] = [];
      const cdataSections = data1.split('<![CDATA[').slice(1);

      // Iterate through the CDATA sections
      for (const cdataSection of cdataSections) {
        // Find the end of the CDATA section
        const cdataEnd = cdataSection.indexOf(']]>');
      
        if (cdataEnd !== -1) {
          // Extract the CDATA content
          const cdataContent = cdataSection.slice(0, cdataEnd);
      
          // Check if the CDATA content contains a src attribute
          if (cdataContent.includes('src="')) {
            // Find the src attribute within the CDATA content
            const srcMatch = /src="([^"]+)"/.exec(cdataContent);
      
            if (srcMatch) {
              const src = srcMatch[1];
              srcAttributes.push(src); // Add the src attribute to the array
              console.log(src); // Output: https://bananapus.eth.limo/52F6E079-80FF-483D-AD3E-480CC5AB1512/Screenshot 2024-01-04 at 23.30.01.png
            }
          } else {
            console.log('CDATA content does not contain a src attribute. Skipping...');
          }
        }
    }
    if (srcAttributes.length == 0)
    {
        return NoCastsFrame()
    }

    const total = srcAttributes.length;

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
    const cast = srcAttributes[index];
    console.log(`srcAttributes: ${cast}`)
    const img = cast;
    

    const frameImageUrl =
        HOST_URL +
        `/api/image/story?img=${img}&index=${index}&total=${total}&date=${Date.now()}`;
    const postUrl =
        HOST_URL +
        `/api/story?index=${index}`;
    return frame200Response(title, frameVersion, frameImageUrl, postUrl, buttonNames)
}

