'use client'

import React, { useState } from 'react'
import InputField from '@/components/InputField'
import { getNeededVenueInfo } from '@/utils/apiCalls'
import { haversineDistance } from '@/utils/helpers'
import styles from './page.module.css'

const CalculatorForm = () => {
  // State for each input field value
  const [venueValue, setVenueValue] = useState('')
  const [cartValue, setCartValue] = useState('')
  const [userLatitude, setUserLatitude] = useState('')
  const [userLongitude, setUserLongitude] = useState('')

  // States to track if the input has an error
  const [venueError, setVenueError] = useState(false)
  const [cartError, setCartError] = useState(false)
  const [latitudeError, setLatitudeError] = useState(false)
  const [longitudeError, setLongitudeError] = useState(false)

  // State for the information shown to the user
  const [deliveryFee, setDeliveryFee] = useState('')
  const [error, setError] = useState('')
  const [priceBreakdown, setPriceBreakdown] = useState({
    cartValue: '',
    smallOrderSurcharge: '',
    deliveryFee: '',
    deliveryDistance: '',
    totalPrice: '',
  })

  // Event handlers
  const handleVenueChange = (value: string) => setVenueValue(value)
  const handleCartChange = (value: string) => setCartValue(value)
  const handleLatitudeChange = (value: string) => setUserLatitude(value)
  const handleLongitudeChange = (value: string) => setUserLongitude(value)

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLatitude(latitude.toFixed(6)) // Limit to 6 decimal places
        setUserLongitude(longitude.toFixed(6))
        setError('') // Clear any previous error messages
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Permission denied. Please allow location access.')
            break
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.')
            break
          case error.TIMEOUT:
            setError('The request to get user location timed out.')
            break
          default:
            setError('An unknown error occurred.')
            break
        }
      }
    )
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    let hasError = false

    // Validation for required fields
    if (!venueValue) {
      setVenueError(true)
      hasError = true
    }

    if (!cartValue || !/^\d+(\.\d{1,2})?$/.test(cartValue)) {
      setCartError(true)
      hasError = true
    }

    if (!userLatitude || !/^-?\d+(\.\d+)?$/.test(userLatitude)) {
      setLatitudeError(true)
      hasError = true
    }

    if (!userLongitude || !/^-?\d+(\.\d+)?$/.test(userLongitude)) {
      setLongitudeError(true)
      hasError = true
    }

    if (hasError) {
      setError('Please fill in all required fields with valid values.')
      return
    }

    // Clear error messages and show calculation progress
    setError('')
    setDeliveryFee('Calculating...')

    try {
      // Fetch venue information
      const venueInfo = await getNeededVenueInfo(venueValue)

      // Extract data from venueInfo
      const {
        coordinates,
        orderMinimumNoSurcharge,
        basePrice,
        distanceRanges,
      } = venueInfo

      // Calculate the delivery distance (straight line)
      const [venueLongitude, venueLatitude] = coordinates
      const distance = haversineDistance(
        parseFloat(userLatitude),
        parseFloat(userLongitude), // User coordinate
        venueLatitude,
        venueLongitude // Venue coordinates
      )

      // Check if delivery is possible (distance exceeds max range)
      const lastRange = distanceRanges[distanceRanges.length - 1]
      if (distance >= lastRange.min && lastRange.max === 0) {
        setError('Delivery is not possible for the given distance.')
        setDeliveryFee('')
        return
      }

      // Calculate small order surcharge
      const cartValueInCents = Math.round(parseFloat(cartValue) * 100)
      const smallOrderSurcharge = Math.max(
        orderMinimumNoSurcharge - cartValueInCents,
        0
      )

      // Calculate delivery fee
      let deliveryFee = basePrice
      for (const range of distanceRanges) {
        if (distance >= range.min && distance < range.max) {
          deliveryFee += range.a + Math.round((range.b * distance) / 10)
          break
        }
      }

      // Calculate total price
      const totalPrice = cartValueInCents + smallOrderSurcharge + deliveryFee

      // Update state with calculated values
      setPriceBreakdown({
        cartValue: (cartValueInCents / 100).toFixed(2) + ' €',
        smallOrderSurcharge: (smallOrderSurcharge / 100).toFixed(2) + ' €',
        deliveryFee: (deliveryFee / 100).toFixed(2) + ' €',
        deliveryDistance: Math.round(distance) + ' m',
        totalPrice: (totalPrice / 100).toFixed(2) + ' €',
      })
      setDeliveryFee('')
      setError('')
    } catch (err) {
      console.error('Error calculating delivery fee:', err)
      setError('Failed to calculate the delivery price. Please try again.')
      setDeliveryFee('')
    }
  }

  return (
    <div className={styles.calculatorContainer}>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <h1>Price Calculator</h1>
        <InputField
          label='Venue Slug'
          onChange={handleVenueChange}
          value={venueValue}
          dataTestId='venueSlug'
          validator={(value) => /^[a-zA-Z-]+$/.test(value)}
          hasError={venueError}
          setHasError={setVenueError}
        />
        <InputField
          label='Cart Value'
          onChange={handleCartChange}
          value={cartValue}
          dataTestId='cartValue'
          validator={(value) => /^(?:\d{0,7}|\d{0,6}[.,]\d{0,1})$/.test(value)}
          hasError={cartError}
          setHasError={setCartError}
        />
        <InputField
          label='User Latitude'
          onChange={handleLatitudeChange}
          value={userLatitude}
          dataTestId='userLatitude'
          validator={(value) => value === '' || /^-?\d*\.?\d*$/.test(value)}
          hasError={latitudeError}
          setHasError={setLatitudeError}
        />
        <InputField
          label='User Longitude'
          onChange={handleLongitudeChange}
          value={userLongitude}
          dataTestId='userLongitude'
          validator={(value) => value === '' || /^-?\d*\.?\d*$/.test(value)}
          hasError={longitudeError}
          setHasError={setLongitudeError}
        />
        <button
          className={styles.button}
          type='button'
          data-test-id='getLocation'
          onClick={handleGetLocation}
        >
          Get Location
        </button>
        <button
          className={styles.button}
          type='submit'
          data-test-id='calculateDeliveryPrice'
        >
          Calculate Delivery Price
        </button>
      </form>

      {/* Price Breakdown */}
      {priceBreakdown.totalPrice && (
        <div className={styles.priceBreakdown}>
          <h2>Price Breakdown</h2>
          <table>
            <tbody>
              <tr>
                <td>Cart Value:</td>
                <td data-test-id='priceCartValue'>
                  {priceBreakdown.cartValue}
                </td>
              </tr>
              <tr>
                <td>Small Order Surcharge:</td>
                <td data-test-id='smallOrderSurcharge'>
                  {priceBreakdown.smallOrderSurcharge}
                </td>
              </tr>
              <tr>
                <td>Delivery Fee:</td>
                <td data-test-id='deliveryFee'>{priceBreakdown.deliveryFee}</td>
              </tr>
              <tr>
                <td>Delivery Distance:</td>
                <td data-test-id='deliveryDistance'>
                  {priceBreakdown.deliveryDistance}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Total Price:</strong>
                </td>
                <td data-test-id='totalPrice'>
                  <strong>{priceBreakdown.totalPrice}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Error Message */}
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  )
}

export default CalculatorForm
