export function frame200Response(title: string, frameVersion: string, frameImageUrl: string, postUrl: string, buttonNames: string[]): Response {
    const html = `
      <!DOCTYPE html> 
      <html>
        <head>
          <title>${title}</title>
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${title}" />
          <meta property="og:image" content="${frameImageUrl}" />
          <meta name="fc:frame" content="${frameVersion}" />
          <meta name="fc:frame:image" content="${frameImageUrl}" />
          <meta name="fc:frame:post_url" content="${postUrl}" />
          ${buttonNames.map(
            (bn, i) => `<meta name="fc:frame:button:${i+1}" content="${bn}" />`
          )}
        </head>
        <body>
          <h1>Bannyverse</h1>
          <p>Farcaster Frame for the Banny</p>
          <dl>
            <dt>Frame Version</dt>
            <dd>${frameVersion}</dd>
            <dt>Frame Image URL</dt>
            <dd>${frameImageUrl}</dd>
            <dt>Post URL</dt>
            <dd>${postUrl}</dd>
            <dt>Button Names</dt>
            <dd>${buttonNames.join(", ")}</dd>
          </dl>
          <p>Built dont-do-this modified by KMac (<a href="https://warpcast.com/4163">Warpcast Profile</a>)
        </body>
      </html>
    `;
  
    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html",
      },
    });
  }
  