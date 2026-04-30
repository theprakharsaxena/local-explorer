export default async function handler(req, res) {
  const { slug } = req.query;
  const path = Array.isArray(slug) ? slug.join('/') : slug;
  
  const params = new URLSearchParams(req.query);
  params.delete('slug');
  
  const url = `https://maps.googleapis.com/maps/api/geocode/${path}?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy failed', message: err.message });
  }
}
