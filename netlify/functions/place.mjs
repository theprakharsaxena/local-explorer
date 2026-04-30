export default async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/place/', '');
  const target = `https://maps.googleapis.com/maps/api/place/${path}${url.search}`;

  try {
    const res = await fetch(target);

    if (path.startsWith('photo')) {
      return new Response(await res.arrayBuffer(), {
        headers: { 'Content-Type': res.headers.get('content-type') || 'image/jpeg' },
      });
    }

    return new Response(JSON.stringify(await res.json()), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const config = { path: "/api/place/*" };
