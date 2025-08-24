// Harvesine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const toRad = (deg: number) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const p1 = toRad(lat1);
  const p2 = toRad(lat2);

  const a = Math.sin(dLat/2)**2 +
            Math.cos(p1) * Math.cos(p2) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}