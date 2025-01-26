// Base coordinates for the venue
const VENUE_COORDINATES = {
  latitude: 60.17094,
  longitude: 24.93087,
};

// Predefined coordinates for specific distances
// Calculated using https://www.calculator.net/distance-calculator.html
const COORDINATES = {
  venue: VENUE_COORDINATES, // Venue's location
  beyond200m: { latitude: 60.169757, longitude: 24.928135 }, // 201.1m away from venue
  beyond500m: { latitude: 60.1665, longitude: 24.927 }, // 539.3m away from venue
  beyond1000m: { latitude: 60.1700, longitude: 24.9122 }, // 1004m away from venue
};

beforeEach(() => {
  // Visit the page before each test
  cy.visit('/')
})

describe('Price Calculation', () => {
  const testScenarios = [
    {
      description: 'Valid input with no surcharge',
      input: {
        venueSlug: 'home-assignment-venue-helsinki',
        cartValue: '100',
        userLatitude: COORDINATES.beyond200m.latitude,
        userLongitude: COORDINATES.beyond200m.longitude,
      },
      mockResponse: {
        static: {
          statusCode: 200,
          body: {
            venue_raw: { location: { coordinates: [COORDINATES.venue.longitude, COORDINATES.venue.latitude] } },
          },
        },
        dynamic: {
          statusCode: 200,
          body: {
            venue_raw: {
              delivery_specs: {
                order_minimum_no_surcharge: 10000,
                delivery_pricing: {
                  base_price: 190,
                  distance_ranges: [
                    { min: 0, max: 500, a: 0, b: 0 },
                    { min: 500, max: 1000, a: 100, b: 1 },
                    { min: 1000, max: 0, a: 0, b: 0 },
                  ],
                },
              },
            },
          },
        },
      },
      expected: {
        cartValue: '100.00 €',
        smallOrderSurcharge: '0.00 €',
        deliveryFee: '1.90 €',
        deliveryDistance: '200 m',
        totalPrice: '101.90 €',
      },
    },
    {
      description: 'Cart value below minimum with surcharge',
      input: {
        venueSlug: 'home-assignment-venue-helsinki',
        cartValue: '8',
        userLatitude: COORDINATES.beyond200m.latitude,
        userLongitude: COORDINATES.beyond200m.longitude,
      },
      mockResponse: {
        static: {
          statusCode: 200,
          body: {
            venue_raw: { location: { coordinates: [COORDINATES.venue.longitude, COORDINATES.venue.latitude] } },
          },
        },
        dynamic: {
          statusCode: 200,
          body: {
            venue_raw: {
              delivery_specs: {
                order_minimum_no_surcharge: 1000,
                delivery_pricing: {
                  base_price: 190,
                  distance_ranges: [
                    { min: 0, max: 500, a: 0, b: 0 },
                    { min: 500, max: 1000, a: 100, b: 1 },
                    { min: 1000, max: 0, a: 0, b: 0 },
                  ],
                },
              },
            },
          },
        },
      },
      expected: {
        cartValue: '8.00 €',
        smallOrderSurcharge: '2.00 €',
        deliveryFee: '1.90 €',
        deliveryDistance: '200 m',
        totalPrice: '11.90 €',
      },
    },
    {
      description: 'Delivery distance exceeds maximum range',
      input: {
        venueSlug: 'home-assignment-venue-helsinki',
        cartValue: '50',
        userLatitude: COORDINATES.beyond1000m.latitude,
        userLongitude: COORDINATES.beyond1000m.longitude,
      },
      mockResponse: {
        static: {
          statusCode: 200,
          body: {
            venue_raw: { location: { coordinates: [COORDINATES.venue.longitude, COORDINATES.venue.latitude] } },
          },
        },
        dynamic: {
          statusCode: 200,
          body: {
            venue_raw: {
              delivery_specs: {
                order_minimum_no_surcharge: 10000,
                delivery_pricing: {
                  base_price: 190,
                  distance_ranges: [
                    { min: 0, max: 500, a: 0, b: 0 },
                    { min: 500, max: 1000, a: 100, b: 1 },
                    { min: 1000, max: 0, a: 0, b: 0 },
                  ],
                },
              },
            },
          },
        },
      },
      expected: {
        errorMessage: 'Delivery is not possible for the given distance.',
      },
    },
    {
      description: 'Cart value matches minimum surcharge threshold',
      input: {
        venueSlug: 'home-assignment-venue-helsinki',
        cartValue: '10',
        userLatitude: COORDINATES.beyond200m.latitude,
        userLongitude: COORDINATES.beyond200m.longitude,
      },
      mockResponse: {
        static: {
          statusCode: 200,
          body: {
            venue_raw: { location: { coordinates: [COORDINATES.venue.longitude, COORDINATES.venue.latitude] } },
          },
        },
        dynamic: {
          statusCode: 200,
          body: {
            venue_raw: {
              delivery_specs: {
                order_minimum_no_surcharge: 1000,
                delivery_pricing: {
                  base_price: 190,
                  distance_ranges: [
                    { min: 0, max: 500, a: 0, b: 0 },
                    { min: 500, max: 1000, a: 100, b: 1 },
                    { min: 1000, max: 0, a: 0, b: 0 },
                  ],
                },
              },
            },
          },
        },
      },
      expected: {
        cartValue: '10.00 €',
        smallOrderSurcharge: '0.00 €',
        deliveryFee: '1.90 €',
        deliveryDistance: '200 m',
        totalPrice: '11.90 €',
      },
    },
    {
      description: 'API returns an error, about incorrect slug',
      input: {
        venueSlug: 'wrong-slug',
        cartValue: '50',
        userLatitude: COORDINATES.beyond200m.latitude,
        userLongitude: COORDINATES.beyond200m.longitude,
      },
      mockResponse: {
        static: { statusCode: 404 },
        dynamic: { statusCode: 404 },
      },
      expected: {
        errorMessage: "Venue not found. Please check the venue slug.",
      },
    },
  ];
  

  testScenarios.forEach(({ description, input, mockResponse, expected }) => {
    it(description, () => {
      // Mock the static API response
      cy.intercept(
        'GET',
        '**/home-assignment-api/v1/venues/home-assignment-venue-helsinki/static',
        mockResponse.static
      ).as('getStaticData')

      // Mock the dynamic API response
      cy.intercept(
        'GET',
        '**/home-assignment-api/v1/venues/home-assignment-venue-helsinki/dynamic',
        mockResponse.dynamic
      ).as('getDynamicData')

      // Fill out the form
      cy.get('[data-test-id="venueSlug"]').type(input.venueSlug)
      cy.get('[data-test-id="cartValue"]').type(input.cartValue)
      cy.get('[data-test-id="userLatitude"]').type(input.userLatitude)
      cy.get('[data-test-id="userLongitude"]').type(input.userLongitude)

      // Click the calculate button
      cy.get('[data-test-id="calculateDeliveryPrice"]').click()

      if (expected.errorMessage) {
        cy.get('[data-test-id="errorMessage"]').should(
          'contain',
          expected.errorMessage
        )
      } else {
        // Wait for API requests to complete
        cy.wait('@getStaticData')
        cy.wait('@getDynamicData')

        // Assert the price breakdown is displayed
        cy.get('[data-test-id="priceCartValue"]').should(
          'contain',
          expected.cartValue
        )
        cy.get('[data-test-id="smallOrderSurcharge"]').should(
          'contain',
          expected.smallOrderSurcharge
        )
        cy.get('[data-test-id="deliveryFee"]').should(
          'contain',
          expected.deliveryFee
        )
        cy.get('[data-test-id="deliveryDistance"]').should(
          'contain',
          expected.deliveryDistance
        )
        cy.get('[data-test-id="totalPrice"]').should(
          'contain',
          expected.totalPrice
        )
      }
    })
  })
})
