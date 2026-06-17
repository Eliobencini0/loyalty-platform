/**
 * Extract Google Place ID from a Google Maps URL
 * Supports various URL formats including shortened goo.gl links
 */
export async function extractPlaceIdFromUrl(url: string): Promise<string | null> {
  try {
    let finalUrl = url;

    // If it's a shortened URL (goo.gl or maps.app.goo.gl), follow redirects to get the full URL
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          redirect: 'follow',
        });
        finalUrl = response.url;
      } catch (error) {
        console.error('Failed to resolve shortened URL:', error);
        // Continue with original URL if redirect fails
      }
    }

    // Try to extract Place ID from various URL patterns

    // Pattern 1: Place ID in !1s parameter (most common in full URLs)
    // Example: ...!1sChIJN1t_tDeuEmsRUsoyLDMNBh4!...
    const pattern1 = /!1s(ChIJ[a-zA-Z0-9_-]+)/;
    const match1 = finalUrl.match(pattern1);
    if (match1) {
      return match1[1];
    }

    // Pattern 2: Place ID in data parameter
    // Example: ...data=!4m...!1s0x0:0x...!8m2!3d...!4d...!16s%2Fg%2F...!19sChIJ...
    const pattern2 = /!19s(ChIJ[a-zA-Z0-9_-]+)/;
    const match2 = finalUrl.match(pattern2);
    if (match2) {
      return match2[1];
    }

    // Pattern 3: Place ID in ftid parameter
    // Example: ...ftid=0x0:0x...&...
    const pattern3 = /place\/[^/]+\/data=[^#]*!3sid:(ChIJ[a-zA-Z0-9_-]+)/;
    const match3 = finalUrl.match(pattern3);
    if (match3) {
      return match3[1];
    }

    // Pattern 4: Direct place ID in path or query params
    const pattern4 = /[?&]place_id=(ChIJ[a-zA-Z0-9_-]+)/;
    const match4 = finalUrl.match(pattern4);
    if (match4) {
      return match4[1];
    }

    // Pattern 5: legacy hex CID → resolve to ChIJ via Google Places API.
    // The maps.app.goo.gl share link typically expands to one of:
    //   !1s0xHEX:0xHEX   (when a !1s segment is present)
    //   ftid=0xHEX:0xHEX (when the URL uses the ftid query param)
    // The writereview endpoint rejects hex placeids, so we need the modern
    // ChIJ. Requires GOOGLE_MAPS_API_KEY.
    const hexMatch = finalUrl.match(/(?:!1s|ftid=)0x[0-9a-f]+:0x([0-9a-f]+)/i);
    if (hexMatch) {
      if (!process.env.GOOGLE_MAPS_API_KEY) {
        console.warn('[placeId] hex CID found but GOOGLE_MAPS_API_KEY is not set — skipping Places API resolution');
      } else {
        try {
          const decimalCid = BigInt('0x' + hexMatch[1]).toString();
          const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?cid=${decimalCid}&fields=place_id&key=${process.env.GOOGLE_MAPS_API_KEY}`;
          console.info(`[placeId] resolving hex CID ${hexMatch[1]} via Places API`);
          const res = await fetch(apiUrl);
          const data = await res.json() as {
            status: string;
            result?: { place_id?: string };
            error_message?: string;
          };
          if (data.status === 'OK' && data.result?.place_id) {
            console.info(`[placeId] resolved to ${data.result.place_id}`);
            return data.result.place_id;
          }
          console.warn(`[placeId] Places API status=${data.status} error=${data.error_message || 'none'}`);
        } catch (apiErr) {
          console.error('[placeId] Places API call failed:', apiErr);
        }
      }
    } else {
      console.warn('[placeId] no hex CID match in URL:', finalUrl);
    }

    console.warn('Could not extract a usable ChIJ Place ID from URL:', finalUrl);
    return null;
  } catch (error) {
    console.error('Error extracting Place ID:', error);
    return null;
  }
}
