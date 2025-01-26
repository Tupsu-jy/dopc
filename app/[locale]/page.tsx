'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import InputField from '@/components/InputField'
import { getNeededVenueInfo } from '@/utils/apiCalls'
import { haversineDistance } from '@/utils/helpers'
import styles from './page.module.css'

const CalculatorForm = () => {
  // i18 Translation
  const t = useTranslations()

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
  const [loading, setLoading] = useState(false)
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

  // Get user's location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError(t('error.locationSupport'))
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
            setError(t('error.locationPermission'))
            break
          case error.POSITION_UNAVAILABLE:
            setError(t('error.positionUnavailable'))
            break
          case error.TIMEOUT:
            setError(t('error.timeout'))
            break
          default:
            setError(t('error.unknown'))
            break
        }
      }
    )
  }

  // Handle form submission. Gets the order information based on the user's input
  // and data that is fetched from the API in this function.
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
      setError(t('error.validation'))
      return
    }

    // Clear error messages and show calculation progress
    setError('')
    setPriceBreakdown({
      cartValue: '',
      smallOrderSurcharge: '',
      deliveryFee: '',
      deliveryDistance: '',
      totalPrice: '',
    })
    setLoading(true)

    try {
      const venueInfo = await getNeededVenueInfo(venueValue)

      if (typeof venueInfo === 'string') {
        setError(venueInfo)
        setLoading(false)
        return
      }

      const {
        coordinates,
        orderMinimumNoSurcharge,
        basePrice,
        distanceRanges,
      } = venueInfo

      const [venueLongitude, venueLatitude] = coordinates
      const distance = haversineDistance(
        parseFloat(userLatitude),
        parseFloat(userLongitude),
        venueLatitude,
        venueLongitude
      )

      const lastRange = distanceRanges[distanceRanges.length - 1]
      if (distance >= lastRange.min && lastRange.max === 0) {
        setError(t('error.deliveryNotPossible'))
        setLoading(false)
        return
      }

      const cartValueInCents = Math.round(parseFloat(cartValue) * 100)
      const smallOrderSurcharge = Math.max(
        orderMinimumNoSurcharge - cartValueInCents,
        0
      )

      let deliveryFee = basePrice
      for (const range of distanceRanges) {
        if (distance >= range.min && distance < range.max) {
          deliveryFee += range.a + Math.round((range.b * distance) / 10)
          break
        }
      }

      const totalPrice = cartValueInCents + smallOrderSurcharge + deliveryFee

      setPriceBreakdown({
        cartValue: (cartValueInCents / 100).toFixed(2) + ' €',
        smallOrderSurcharge: (smallOrderSurcharge / 100).toFixed(2) + ' €',
        deliveryFee: (deliveryFee / 100).toFixed(2) + ' €',
        deliveryDistance: Math.round(distance) + ' m',
        totalPrice: (totalPrice / 100).toFixed(2) + ' €',
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError(t('error.serverError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.calculatorContainer}>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <h1>{t('title')}</h1>
        <InputField
          label={t('venueSlug')}
          onChange={handleVenueChange}
          value={venueValue}
          dataTestId='venueSlug'
          validator={(value) => /^[a-zA-Z-]+$/.test(value)}
          hasError={venueError}
          setHasError={setVenueError}
        />
        <InputField
          label={t('cartValue')}
          onChange={handleCartChange}
          value={cartValue}
          dataTestId='cartValue'
          validator={(value) => /^(?:\d{0,7}|\d{0,6}[.,]\d{0,1})$/.test(value)}
          hasError={cartError}
          setHasError={setCartError}
        />
        <InputField
          label={t('latitude')}
          onChange={handleLatitudeChange}
          value={userLatitude}
          dataTestId='userLatitude'
          validator={(value) => value === '' || /^-?\d*\.?\d*$/.test(value)}
          hasError={latitudeError}
          setHasError={setLatitudeError}
        />
        <InputField
          label={t('longitude')}
          onChange={handleLongitudeChange}
          value={userLongitude}
          dataTestId='userLongitude'
          validator={(value) => value === '' || /^-?\d*\.?\d*$/.test(value)}
          hasError={longitudeError}
          setHasError={setLongitudeError}
        />
        <button
          aria-label={t('getLocation')}
          className={styles.button}
          type='button'
          data-test-id='getLocation'
          onClick={handleGetLocation}
        >
          {t('getLocation')}
        </button>
        <button
          aria-label={t('submitButton')}
          className={styles.button}
          type='submit'
          data-test-id='calculateDeliveryPrice'
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? t('calculating') : t('submitButton')}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div
          data-test-id='errorMessage'
          className={styles.error}
          aria-live='assertive'
        >
          {error}
        </div>
      )}
      {/* Placeholder */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          {t('calculating')}
        </div>
      )}

      {/* Price Breakdown */}
      {priceBreakdown.totalPrice && (
        <div className={styles.priceBreakdown} aria-live='polite'>
          <h2 id='priceBreakdownHeading'>{t('priceBreakdown.title')}</h2>
          <table aria-labelledby='priceBreakdownHeading'>
            <thead>
              <tr>
                <th scope='col'>{t('priceBreakdown.description')}</th>
                <th scope='col'>{t('priceBreakdown.value')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td scope='row' aria-label={t('priceBreakdown.cartValue')}>
                  {t('priceBreakdown.cartValue')}
                </td>
                <td data-test-id='priceCartValue'>
                  {priceBreakdown.cartValue}
                </td>
              </tr>
              <tr>
                <td
                  scope='row'
                  aria-label={t('priceBreakdown.smallOrderSurcharge')}
                >
                  {t('priceBreakdown.smallOrderSurcharge')}
                </td>
                <td data-test-id='smallOrderSurcharge'>
                  {priceBreakdown.smallOrderSurcharge}
                </td>
              </tr>
              <tr>
                <td scope='row' aria-label={t('priceBreakdown.deliveryFee')}>
                  {t('priceBreakdown.deliveryFee')}
                </td>
                <td data-test-id='deliveryFee'>{priceBreakdown.deliveryFee}</td>
              </tr>
              <tr>
                <td
                  scope='row'
                  aria-label={t('priceBreakdown.deliveryDistance')}
                >
                  {t('priceBreakdown.deliveryDistance')}
                </td>
                <td data-test-id='deliveryDistance'>
                  {priceBreakdown.deliveryDistance}
                </td>
              </tr>
              <tr className={styles.total}>
                <td scope='row' aria-label={t('priceBreakdown.totalPrice')}>
                  {t('priceBreakdown.totalPrice')}
                </td>
                <td data-test-id='totalPrice'>{priceBreakdown.totalPrice}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default CalculatorForm
