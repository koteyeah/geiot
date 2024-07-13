export async function getPositionDifference(
  lat: number,
  lon: number
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // 現在地と目的地の距離を計算する関数
          const calculateDistance = (
            lat1: number,
            lon1: number,
            lat2: number,
            lon2: number
          ) => {
            const R = 6371e3; // Radius of the Earth in meters
            const φ1 = lat1 * (Math.PI / 180); // φ, λ in radians
            const φ2 = lat2 * (Math.PI / 180);
            const Δφ = (lat2 - lat1) * (Math.PI / 180);
            const Δλ = (lon2 - lon1) * (Math.PI / 180);

            const a =
              Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            const distance = R * c; // Distance in meters
            return distance;
          };

          // 目的地と現在地の距離を計算
          const distance = calculateDistance(lat, lon, latitude, longitude);
          console.log("目的地と現在地の距離:", distance, "m");
          const isOK = distance <= 500;
          resolve(isOK);
        },
        (error) => {
          console.error("位置情報の取得に失敗しました:", error);
          reject(error);
        }
      );
    } else {
      console.error("位置情報の取得がサポートされていません。");
      reject(new Error("位置情報の取得がサポートされていません。"));
    }
  });
}
