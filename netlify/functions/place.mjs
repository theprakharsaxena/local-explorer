export default async (req) => {
  const url = new URL(req.url);
  const pathAfterPlace = url.pathname.replace('/.netlify/functions/place/', '').replace('/.netlify/functions/place', '');

  // Forward all query params
  const queryString = url.search;
  const targetUrl = `https://maps.googleapis.com/maps/api/place/${pathAfterPlace}${queryString}`;

  try {
    const response = await fetch(targetUrl);
    const contentType = response.headers.get('content-type') || '';

    // For photo endpoints, forward the image
    if (pathAfterPlace.startsWith('photo')) {
      const buffer = await response.arrayBuffer();
      return new Response(buffer, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy failed', message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = {
  path: "/api/place/*",
};
