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
        userLatitude: '60.169757',
        userLongitude: '24.928135',
      },
      mockResponse: {
        static: {
          statusCode: 200,
          body: {
            venue_raw: {
              location: {
                coordinates: [24.93087, 60.17094], // [longitude, latitude]
              },
            },
          },
        },
        dynamic: {
          statusCode: 200,
          body: {
            venue_raw: {
              delivery_specs: {
                order_minimum_no_surcharge: 10000, // in cents
                delivery_pricing: {
                  base_price: 190, // in cents
                  distance_ranges: [
                    { min: 0, max: 500, a: 0, b: 0 },
                    { min: 500, max: 1000, a: 100, b: 1 },
                    { min: 1000, max: 0, a: 0, b: 0 }, // No delivery beyond 1000m
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
        userLatitude: '60.169757',
        userLongitude: '24.928135',
      },
      mockResponse: {
        static: {
          statusCode: 200,
          body: {
            venue_raw: {
              location: {
                coordinates: [24.93087, 60.17094],
              },
            },
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
        userLatitude: '60.300000', // Far from venue
        userLongitude: '25.000000', // Far from venue
      },
      mockResponse: {
        static: {
          statusCode: 200,
          body: {
            venue_raw: {
              location: {
                coordinates: [24.93087, 60.17094],
              },
            },
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
        cartValue: '10', // Matches the minimum
        userLatitude: '60.169757',
        userLongitude: '24.928135',
      },
      mockResponse: {
        static: {
          statusCode: 200,
          body: {
            venue_raw: {
              location: {
                coordinates: [24.93087, 60.17094],
              },
            },
          },
        },
        dynamic: {
          statusCode: 200,
          body: {
            venue_raw: {
              delivery_specs: {
                order_minimum_no_surcharge: 1000, // 10 EUR in cents
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
      description: 'Cart value is extremely low with high surcharge',
      input: {
        venueSlug: 'home-assignment-venue-helsinki',
        cartValue: '1', // Very low cart value
        userLatitude: '60.169757',
        userLongitude: '24.928135',
      },
      mockResponse: {
        static: {
          statusCode: 200,
          body: {
            venue_raw: {
              location: {
                coordinates: [24.93087, 60.17094],
              },
            },
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
        cartValue: '1.00 €',
        smallOrderSurcharge: '9.00 €',
        deliveryFee: '1.90 €',
        deliveryDistance: '200 m',
        totalPrice: '11.90 €',
      },
    },
    {
      description: 'Delivery distance exactly at range boundary',
      input: {
        venueSlug: 'home-assignment-venue-helsinki',
        cartValue: '50',
        userLatitude: '60.17000', // Latitude adjusted for boundary
        userLongitude: '24.93050', // Longitude adjusted for boundary
      },
      mockResponse: {
        static: {
          statusCode: 200,
          body: {
            venue_raw: {
              location: {
                coordinates: [24.93087, 60.17094],
              },
            },
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
        cartValue: '50.00 €',
        smallOrderSurcharge: '0.00 €',
        deliveryFee: '2.90 €',
        deliveryDistance: '500 m', // Exactly at boundary
        totalPrice: '52.90 €',
      },
    },
    {
      description: 'API returns an error',
      input: {
        venueSlug: 'home-assignment-venue-helsinki',
        cartValue: '50',
        userLatitude: '60.169757',
        userLongitude: '24.928135',
      },
      mockResponse: {
        static: { statusCode: 500 },
        dynamic: { statusCode: 500 },
      },
      expected: {
        errorMessage: 'Failed to fetch venue data. Please try again.',
      },
    },
  ]

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
    })
  })
})
