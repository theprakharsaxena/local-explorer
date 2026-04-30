export default async (req) => {
  const url = new URL(req.url);
  const pathAfterGeocode = url.pathname.replace('/.netlify/functions/geocode/', '').replace('/.netlify/functions/geocode', '');

  const queryString = url.search;
  const targetUrl = `https://maps.googleapis.com/maps/api/geocode/${pathAfterGeocode}${queryString}`;

  try {
    const response = await fetch(targetUrl);
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
  path: "/api/geocode/*",
};
