export default async function handler(req, res) {
  const { slug, ...queryParams } = req.query;
  const path = Array.isArray(slug) ? slug.join('/') : slug;

  // Build clean query string from remaining params
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams)) {
    params.set(key, Array.isArray(value) ? value[0] : value);
  }

  const url = `https://maps.googleapis.com/maps/api/place/${path}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || '';

    // For photo redirects, forward the image bytes
    if (path.startsWith('photo')) {
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.status(response.status).send(Buffer.from(buffer));
    }

    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy failed', message: err.message });
  }
}
