import React, { Fragment, useEffect, useState } from 'react'
import { HashLink as Link } from 'react-router-hash-link';
import { Redirect, useHistory } from 'react-router-dom';
import PropTypes from 'prop-types'
import { connect } from 'react-redux';

import AuthPrompt from '../layout/AuthPrompt'

import { confirmRideHail, getCurrentOrder } from '../../actions/logistics'

const RideHail = ({
  auth: { userLoading, user, isAuthenticated },
  siteConfig: { siteInfo },
  logistics: { currentOrder, currentOrderLoading },
  confirmRideHail,
  getCurrentOrder
}) => {
  const history = useHistory()

  const [delivery, setDelivery] = useState("");

  const [currentMap, setCurrentMap] = useState('');
  const [pickupSearchBox, setPickupSearchBox] = useState(''); 
  const [deliverySearchBox, setDeliverySearchBox] = useState(''); 
  const [pickupMarker, setPickupMarker] = useState('');
  const [deliveryMarker, setDeliveryMarker] = useState('');

  const [activeModal, setActiveModal] = useState('');

  const [vehicleChoice, setVehicleChoice] = useState(siteInfo.vehicles.filter(vehicle => vehicle.name === 'motorcycle')[0].id);

  const [firstName, setFirstName] = useState(user ? (user.first_name ? user.first_name : '') : '');
  const [lastName, setLastName] = useState(user ? (user.last_name ? user.last_name : '') : '');
  const [contact, setContact] = useState(user ? (user.contact ? user.contact : '') : '');
  const [email, setEmail] = useState(user ? (user.email ? user.email : '') : '');
  const [gender, setGender] = useState(user ? (user.gender ? user.gender : '') : '');

  const [pickupLat, setPickupLat] = useState('');
  const [pickupLng, setPickupLng] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryLat, setDeliveryLat] = useState('');
  const [deliveryLng, setDeliveryLng] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
  
  const locationGeocode = (latLng, mode) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          if (mode === 'pickup') {
            setPickupAddress(results[0].formatted_address)
          } else if (mode === 'delivery') {
            setDeliveryAddress(results[0].formatted_address)
          }
        } else {
          window.alert("No results found");
        }
      } else {
        window.alert("Geocoder failed due to: " + status);
      }
    });
  }

  const showGoogleMaps = () => {
    const centerLatLng = new google.maps.LatLng(13.938080242321387, 121.61336104698454)

    // Map options
    const LUCENA_BOUNDS = {
      north: 13.990870,
      south: 13.889484,
      west: 121.554958,
      east: 121.709314,
    }

    // Map options
    const mapOptions = {
      zoom: 14,
      restriction: {
        latLngBounds: LUCENA_BOUNDS,
        strictBounds: false
      },
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.LEFT_BOTTOM
      },
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      },
      streetViewControl: false,
      scaleControl: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: centerLatLng,
    }

    // Create and set map
    const map = new google.maps.Map(document.getElementById('googlemap'), mapOptions)
    setCurrentMap(map);

    // Display a caption in the map with user location
    const infoWindow = new google.maps.InfoWindow;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        let pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        if (pos.lat <= LUCENA_BOUNDS.north && pos.lat >= LUCENA_BOUNDS.south && pos.lng >= LUCENA_BOUNDS.west && pos.lng >= LUCENA_BOUNDS.east) {
          infoWindow.setPosition(pos);
          infoWindow.setContent('You');
          infoWindow.open(map);
        }
        map.setCenter(centerLatLng);
      }, function() {
      });
    }

    // Initialize location search bar
    initAutocomplete(map);
  };
  
  const initAutocomplete = (map) => {
    // Create and set variable for pickup search bar
    const pickupInput = $('#pickup_address')[0];
    const pickupSearchBox = new google.maps.places.SearchBox(pickupInput);
    setPickupSearchBox(pickupSearchBox);
    
    // Create and set variable for delivery search bar
    const deliveryInput = $('#delivery_address')[0];
    const deliverySearchBox = new google.maps.places.SearchBox(deliveryInput);
    setDeliverySearchBox(deliverySearchBox);

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(pickupInput);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(deliveryInput);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
      pickupSearchBox.setBounds(map.getBounds());
      deliverySearchBox.setBounds(map.getBounds());
    });
  }

  const addSearchListener = (mode) => {
    let mapSearchBox;
    
    if (mode === 'pickup') {
      mapSearchBox = pickupSearchBox
    } else if ('delivery') {
      mapSearchBox = deliverySearchBox
    }
    
    google.maps.event.clearInstanceListeners(mapSearchBox);

    mapSearchBox.addListener("places_changed", () => {
      const places = mapSearchBox.getPlaces();
      
      if (places) if (places.length == 0) {
        return;
      }
      
      // For each place, get the icon, name and location.
      const bounds = new google.maps.LatLngBounds();
      places.forEach(place => {
        event = {
          latLng: place.geometry.location,
          placeId: place.place_id
        }
        if (!place.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }
        
        addMarker(event, mode)
        // const icon = {
        //   url: place.icon,
        //   size: new google.maps.Size(71, 71),
        //   origin: new google.maps.Point(0, 0),
        //   anchor: new google.maps.Point(17, 34),
        //   scaledSize: new google.maps.Size(25, 25)
        // };
  
        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      currentMap.fitBounds(bounds);
    });
  }
    
  const setUpAddress = mode => {
    setActiveModal(mode)
    google.maps.event.clearInstanceListeners(currentMap);
    currentMap.addListener('click', e => addMarker(e, mode));

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    addSearchListener(mode);
  }

  let pickupMarkerDown;
  let deliveryMarkerDown;

  const addMarker = (e, mode) => {
    if (mode === 'pickup') {
      // Deletes previous marker from both confirmed and current sessions
      pickupMarker !== '' && pickupMarker.setMap(null)
      pickupMarkerDown && pickupMarkerDown.setMap(null)

      const newPickupMarker = new google.maps.Marker({
        position: e.latLng,
        map: currentMap,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        },
        draggable: true,
        animation: google.maps.Animation.DROP
      });

      setPickupMarker(newPickupMarker);
      pickupMarkerDown = newPickupMarker
      newPickupMarker.setMap(currentMap)

      setPickupLat(newPickupMarker.getPosition().lat())
      setPickupLng(newPickupMarker.getPosition().lng())
      
      newPickupMarker.addListener('dragend', function(e) {
        const locationLatLng = new google.maps.LatLng(newPickupMarker.getPosition().lat(), newPickupMarker.getPosition().lng())
        locationGeocode(locationLatLng, mode);
        setPickupLat(newPickupMarker.getPosition().lat())
        setPickupLng(newPickupMarker.getPosition().lng())
      });

      const locationLatLng = new google.maps.LatLng(newPickupMarker.getPosition().lat(), newPickupMarker.getPosition().lng())
      locationGeocode(locationLatLng, mode);

    } else if (mode === 'delivery') {
      // Deletes previous marker from both confirmed and current sessions
      deliveryMarker !== '' && deliveryMarker.setMap(null)
      deliveryMarkerDown && deliveryMarkerDown.setMap(null)

      const newDeliveryMarker = new google.maps.Marker({
        position: e.latLng,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        },
        map: currentMap,
        draggable: true,
        animation: google.maps.Animation.DROP
      });

      setDeliveryMarker(newDeliveryMarker);
      deliveryMarkerDown = newDeliveryMarker
      newDeliveryMarker.setMap(currentMap)

      setDeliveryLat(newDeliveryMarker.getPosition().lat())
      setDeliveryLng(newDeliveryMarker.getPosition().lng())

      newDeliveryMarker.addListener('dragend', e => {
        const locationLatLng = new google.maps.LatLng(newDeliveryMarker.getPosition().lat(), newDeliveryMarker.getPosition().lng())
        locationGeocode(locationLatLng, mode);
        setDeliveryLat(newDeliveryMarker.getPosition().lat())
        setDeliveryLng(newDeliveryMarker.getPosition().lng())
      });

      const locationLatLng = new google.maps.LatLng(newDeliveryMarker.getPosition().lat(), newDeliveryMarker.getPosition().lng())
      locationGeocode(locationLatLng, mode);
    }
  }

  const proceedToPayment = async () => {
    if(pickupLat && pickupLng && pickupAddress && deliveryLat && deliveryLng && deliveryAddress && firstName && lastName && contact && email && gender ? true : false) {
      const formData = {
        vehicleChoice,
        firstName, lastName, contact, email, gender,
        pickupLat, pickupLng, pickupAddress,
        deliveryLat, deliveryLng, deliveryAddress,
      }
      confirmRideHail({
        formData,
        history
      })
    } else {
      $('.form-notification').attr('style', 'opacity: 1')
      M.toast({
        html: 'Form incomplete',
        displayLength: 3500,
        classes: 'red'
      });
    }
  }
  
  useEffect(() => {
    if (!userLoading && isAuthenticated && !user.groups.includes('rider') === true) {
      getCurrentOrder({
        type: 'ride_hail'
      })
      showGoogleMaps();
  
      $('.modal').modal({
        dismissible: true,
        inDuration: 300,
        outDuration: 200,
      });
  
      $('.collapsible').collapsible({
        accordion: false
      });
      $('.tooltipped').tooltip();
    }
  }, [userLoading]);
  
  useEffect(() => {
    if (!currentOrderLoading) {
      if (currentOrder) {
        setGender(currentOrder.gender ? currentOrder.gender : "")
        setPickupLat(currentOrder.loc1_latitude ? currentOrder.loc1_latitude : "")
        setPickupLng(currentOrder.loc1_longitude ? currentOrder.loc1_longitude : "")
        setPickupAddress(currentOrder.loc1_address ? currentOrder.loc1_address : "")
        setDeliveryLat(currentOrder.loc2_latitude ? currentOrder.loc2_latitude : "")
        setDeliveryLng(currentOrder.loc2_longitude ? currentOrder.loc2_longitude : "")
        setDeliveryAddress(currentOrder.loc2_address ? currentOrder.loc2_address : "")
      }
    }
  }, [currentOrderLoading]);

  useEffect(() => {
    $('select').formSelect();
    M.updateTextFields();
  }, [gender]);

  useEffect(() => {
    if (pickupAddress && deliveryAddress) {
      const origin = new google.maps.LatLng(pickupLat, pickupLng);
      const destination =  new google.maps.LatLng(deliveryLat, deliveryLng);
    
      try {
        const distanceService = new google.maps.DistanceMatrixService();
        distanceService.getDistanceMatrix({
          origins: [origin],
          destinations: [destination],
          travelMode: 'DRIVING',
        }, async (response, status) => {
          if (status === 'OK') {
            const distanceValue = response.rows[0].elements[0].distance.value
            let total = Math.round((parseInt(distanceValue)/1000))*siteInfo.vehicles.filter(vehicle => vehicle.id === vehicleChoice)[0].per_km_price
            if (total < 50) total = 50
            setDelivery(total)
          }
        });
      } catch (err) {
        console.log('error', err.data)
      }
    }
  }, [pickupAddress, deliveryAddress, vehicleChoice]);

  return (
    isAuthenticated && !user.groups.includes('rider') === true ? (
      <section className="section section-delivery grey lighten-5">
        <div className="container">
          <h4>Book a Ride</h4>
          <ul className="collapsible">
            <li className="active">
              <div className="collapsible-header relative">
                <span className="main-title">Personal Details</span>
                {!lastName || !firstName || !contact || !email || !gender ? (
                  <i className="material-icons red-text form-notification">error</i>
                ) : (
                  <i className="material-icons green-text form-notification">check_circle</i>
                )}
                <i className="material-icons">keyboard_arrow_down</i>
              </div>
              <div className="collapsible-body grey lighten-4">
                <div className="row">
                  <div className="col s12 m6">
                    <div className="input-field relative">
                      <input type="text" id="first_name" className="validate grey-text text-darken-2" onChange={e => setFirstName(e.target.value)} required value={firstName}/>
                      <label htmlFor="first_name" className="grey-text text-darken-2">First Name</label>
                      <span className="helper-text" data-error="This field is required"></span>
                    </div>
                  </div>
                  <div className="col s12 m6">
                    <div className="input-field relative">
                      <input type="text" id="last_name" className="validate grey-text text-darken-2" value={lastName} onChange={e => setLastName(e.target.value)} required/>
                      <label htmlFor="last_name" className="grey-text text-darken-2">Last Name</label>
                      <span className="helper-text" data-error="This field is required"></span>
                    </div>
                  </div>
                  <div className="col s12 m12 l4">
                    <div className="input-field relative">
                      <input type="text" id="contact" className="validate grey-text text-darken-2" value={contact} onChange={e => setContact(e.target.value)} required/>
                      <label htmlFor="contact" className="grey-text text-darken-2">Contact</label>
                      <span className="helper-text" data-error="This field is required"></span>
                    </div>
                  </div>
                  <div className="col s12 m12 l4">
                    <div className="input-field relative">
                      <input type="text" id="email" className="validate grey-text text-darken-2" value={email} onChange={e => setEmail(e.target.value)} required/>
                      <label htmlFor="email" className="grey-text text-darken-2">Email</label>
                      <span className="helper-text" data-error="This field is required"></span>
                    </div>
                  </div>
                  <div className="col s12 m12 l4">
                    <div className="input-field">
                      <select id="gender" className="text-grey validate grey-text text-darken-2" value={gender} onChange={e => setGender(e.target.value)} required>
                        <option value="" disabled>Select a Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      <label htmlFor="gender" className="grey-text text-darken-2">Gender</label>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li className="active">
              <div className="collapsible-header valign-wrapper relative">
                <span className="main-title">Set Pickup & Delivery</span>
                {!pickupLat || !pickupLng || !pickupAddress || !deliveryLat || !deliveryLng || !deliveryAddress ? (
                  <i className="material-icons red-text form-notification">error</i>
                ) : (
                  <i className="material-icons green-text form-notification">check_circle</i>
                )}
                <i className="material-icons">keyboard_arrow_down</i>
              </div>
              <div className="collapsible-body maps-body relative grey lighten-4">
                <div className="row">
                  <div className="collection">
                    <a href="#" data-target="addressmodal" className="collection-item grey-text text-darken-2 modal-trigger" onClick={() => setUpAddress('pickup')}>
                      <span className="badge">
                        <i className="material-icons green-text darken-2">house</i>
                      </span>
                      Pickup Address: ({pickupLat && pickupLng ? (pickupAddress ? pickupAddress : `${pickupLat}, ${pickupLng}`) : 'Please set a pickup address'})
                    </a>
                    <a href="#" data-target="addressmodal" className="collection-item grey-text text-darken-2 modal-trigger" onClick={() => setUpAddress('delivery')}>
                      <span className="badge">
                        <i className="material-icons blue-text darken-2">local_shipping</i>
                      </span>
                      Delivery Address: ({deliveryLat && deliveryLng ? (deliveryAddress ? deliveryAddress : `${deliveryLat}, ${deliveryLng}`) : 'Please set a delivery address'})
                    </a>
                  </div>
                </div>
                <div className="row flex-row">
                  <div className={`vehicle-selection mr-2 ${vehicleChoice === siteInfo.vehicles.filter(vehicle => vehicle.name === 'motorcycle')[0].id && 'active'}`} onClick={() => setVehicleChoice(siteInfo.vehicles.filter(vehicle => vehicle.name === 'motorcycle')[0].id)}>
                    <i className="material-icons fs-30">two_wheeler</i>
                    <p className="m-0 no-white-space fw-6">Motorcycle</p>
                    <p className="m-0 no-white-space">1 Seat</p>
                  </div>
                  <div className={`vehicle-selection ${vehicleChoice === siteInfo.vehicles.filter(vehicle => vehicle.name === 'tricycle')[0].id && 'active'}`} onClick={() => setVehicleChoice(siteInfo.vehicles.filter(vehicle => vehicle.name === 'tricycle')[0].id)}>
                    <i className="material-icons fs-30">moped</i>
                    <p className="m-0 no-white-space fw-6">Tricycle</p>
                    <p className="m-0 no-white-space">1-2 Seats</p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <button className="btn btn-large btn-extended green lighten-1 bold mt-5 mb-2 mobile-btn waves-effect waves-green" onClick={proceedToPayment}>
            <span className="btn-float-text">{delivery && vehicleChoice ? `₱${(parseFloat(delivery)).toFixed(2)}` : ''}</span>
            Confirm Booking
          </button>
          <div id="addressmodal" className="modal supermodal">
            <div id="googlemap"></div>
            <div className="modal-footer">
              {/* Pickup Modal Input */}
              <input id="pickup_address" type="text" placeholder="Please set a pickup address" className={`addressmodal-input ${activeModal === 'pickup' ? 'open' : ''}`}
                value={pickupLat && pickupLng ? (pickupAddress ? pickupAddress : `(${pickupLat}), (${pickupLng})`) : pickupAddress}
                onChange={e => {
                  setPickupAddress(e.target.value);
                  setPickupLat('');
                  setPickupLng('');
                }}
              />
              {/* Delivery Modal Input */}
              <input id="delivery_address" type="text" placeholder="Please set a delivery address" className={`addressmodal-input ${activeModal === 'delivery' ? 'open' : ''}`}
                value={deliveryLat && deliveryLng ? (deliveryAddress ? deliveryAddress : `(${deliveryLat}), (${deliveryLng})`) : deliveryAddress}
                onChange={e => {
                  setDeliveryAddress(e.target.value);
                  setDeliveryLat('');
                  setDeliveryLng('');
                }}
              />
              <a className="modal-action modal-close cancel-fixed"><i className="material-icons grey-text">close</i></a>
              <a className="modal-action modal-close waves-effect waves-blue btn center blue btn-large btn-extended">Confirm</a>
            </div>
          </div>
        </div>
      </section>
    ) : (
      <AuthPrompt/>
    )
  )
}

RideHail.propTypes = {
  confirmRideHail: PropTypes.func.isRequired,
  getCurrentOrder: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  auth: state.auth,
  siteConfig: state.siteConfig,
  logistics: state.logistics,
});

export default connect(mapStateToProps, { confirmRideHail, getCurrentOrder })(RideHail);