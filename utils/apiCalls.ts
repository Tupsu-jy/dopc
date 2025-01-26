const venueApiUrl = "https://consumer-api.development.dev.woltapi.com/home-assignment-api/v1/venues/";

/**
 * Helper function to handle error responses from the fetch call
 * @param response Response object from the fetch call
 * @returns Error message based on the response status
 */
const handleResponseError = (response: Response): string => {
  if (response.status === 404) {
    return "Venue not found. Please check the venue slug.";
  } else if (response.status >= 500) {
    return "The server is currently unavailable. Please try again later.";
  } else {
    return "An unexpected error occurred. Please try again.";
  }
};
/**
 * Makes two api calls to fetch the static and dynamic data for a given venue slug
 * @param slug Venue id string used in api call
 * @returns Either the venue information or an error message
 */
export const getNeededVenueInfo = async (slug: string): Promise<
  | {
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
    }
  | string // Error message
> => {
  try {
    const urlWithSlug = venueApiUrl + slug;

    // Fetch static data
    const staticResponse = await fetch(urlWithSlug + "/static", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!staticResponse.ok) {
      return handleResponseError(staticResponse);
    }

    const staticData = await staticResponse.json();

    // Fetch dynamic data
    const dynamicResponse = await fetch(urlWithSlug + "/dynamic", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!dynamicResponse.ok) {
      return handleResponseError(dynamicResponse);
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
    console.error("Unexpected error fetching venue information:", error);

    // Return a generic error message for unexpected issues
    return "An unexpected error occurred while fetching venue information. Please try again.";
  }
};
