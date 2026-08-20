function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 8000,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

export async function detectLocation() {
  const pos = await getPosition();
  const { latitude, longitude } = pos.coords;
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=he`
  );
  if (!res.ok) throw new Error(`reverse geocode failed: ${res.status}`);
  const data = await res.json();
  return {
    countryCode: data.countryCode,
    location: data.city || data.locality || data.principalSubdivision || "",
  };
}
