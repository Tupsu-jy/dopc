const venueApiUrl = "https://consumer-api.development.dev.woltapi.com/home-assignment-api/v1/venues/";

export const getNeededVenueInfo = async (slug: string): Promise<{
  coordinates: [number, number];
  orderMinimumNoSurcharge: number;
  basePrice: number;
  distanceRanges: {
    min: number;
    max: number;
    a: number;
    b: number;
    flag: any;
  }[];
}> => {
  try {
    const urlWithSlug = venueApiUrl + slug;

    // Fetch static data
    const staticResponse = await fetch(urlWithSlug + "/static", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!staticResponse.ok) {
      throw new Error(`Error fetching static data: ${staticResponse.status}`);
    }

    const staticData = await staticResponse.json();

    // Fetch dynamic data
    const dynamicResponse = await fetch(urlWithSlug + "/dynamic", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!dynamicResponse.ok) {
      throw new Error(`Error fetching dynamic data: ${dynamicResponse.status}`);
    }

    const dynamicData = await dynamicResponse.json();

    // Extract relevant fields
    const coordinates = staticData.venue_raw.location.coordinates; // [longitude, latitude]
    const orderMinimumNoSurcharge =
      dynamicData.venue_raw.delivery_specs.order_minimum_no_surcharge;
    const basePrice =
      dynamicData.venue_raw.delivery_specs.delivery_pricing.base_price;
    const distanceRanges =
      dynamicData.venue_raw.delivery_specs.delivery_pricing.distance_ranges;

    // Return the relevant data in a structured format
    return {
      coordinates,
      orderMinimumNoSurcharge,
      basePrice,
      distanceRanges,
    };
  } catch (error) {
    console.error("Error fetching venue information:", error);
    throw error;
  }
};
