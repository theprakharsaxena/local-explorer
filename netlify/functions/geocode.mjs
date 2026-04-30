export default async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/geocode/', '');
  const target = `https://maps.googleapis.com/maps/api/geocode/${path}${url.search}`;

  try {
    const res = await fetch(target);
    return new Response(JSON.stringify(await res.json()), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const config = { path: "/api/geocode/*" };
