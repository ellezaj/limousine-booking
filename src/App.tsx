import React, { useState, useEffect } from 'react';
import { getBookings, createBooking, getAirports, loadGoogleMaps, getPlacePredictions, getPlaceDetails } from './api';
import CountryPhoneInput from 'react-country-phone-input';
import 'react-country-phone-input/lib/style.css';
import Footer from './components/Footer';
import Header from './components/Header';

function App() {
    const [formData, setFormData] = useState({
        tripType: 'oneway',
        pickupDate: '',
        pickupTime: '',
        pickupLocationType: 'location',
        pickupLocation: '',
        pickupLat: null,
        pickupLng: null,
        pickupLocationAirport: '',
        hours: '',
        dropoffLocationType: 'location',
        dropoffLocation: '',
        dropoffLat: null,
        dropoffLng: null,
        dropoffLocationAirport: '',
        contactPhone: '',
        contactFirstName: '',
        contactLastName: '',
        contactEmail: '',
        passengers: '',
    });

    const [distance, setDistance] = useState<string | null>(null);
    const [duration, setDuration] = useState<string | null>(null);

    const handleFieldChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const [bookings, setBookings] = useState<any[]>([]);
    const [airports, setAirports] = useState<any[]>([]);

    useEffect(() => {
        loadGoogleMaps();
        getBookings()
            .then((data) => setBookings(data))
            .catch((err) => console.error('Failed to load bookings', err));

        getAirports()
            .then((data) => setAirports(data))
            .catch((err) => console.error('Failed to load airports', err));

        if (
            formData.pickupLat &&
            formData.pickupLng &&
            formData.dropoffLat &&
            formData.dropoffLng
        ) {
            calculateDistance();
        }
    }, [formData.pickupLat,
    formData.pickupLng,
    formData.dropoffLat,
    formData.dropoffLng]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const created = await createBooking(formData);
            setBookings(prev => [...prev, created]);
            alert('Booking created');
        } catch (err) {
            console.error(err);
            alert('Failed to create booking');
        }
    };

    const [contactPhoneExists, setContactPhoneExists] = useState(true);

    const checkChontactPhoneExists = () => {
        const exists = bookings.some(b => b.contactPhone === formData.contactPhone);
        setContactPhoneExists(exists);
    };


    const [pickupPredictions, setPickupPredictions] = useState<any[]>([]);
    const [dropoffPredictions, setDropoffPredictions] = useState<any[]>([]);

    const handleLocationSearch = async (
        value: string,
        setPredictions: React.Dispatch<React.SetStateAction<any[]>>
    ) => {
        const results = await getPlacePredictions(value);
        setPredictions(results);
    };

    const handlePlaceSelect = async (
        placeId: string,
        locationField: string,
        latField: string,
        lngField: string,
        clearPredictions: () => void
    ) => {
        try {
            const details = await getPlaceDetails(placeId);

            handleFieldChange(
                locationField,
                details.formatted_address
            );

            handleFieldChange(
                latField,
                details.geometry.location.lat()
            );

            handleFieldChange(
                lngField,
                details.geometry.location.lng()
            );

            clearPredictions();
        } catch (err) {
            console.error(err);
        }
    };

    const calculateDistance = async () => {
        const google = (window as any).google;

        const service = new google.maps.DistanceMatrixService();

        service.getDistanceMatrix(
            {
                origins: [
                    {
                        lat: formData.pickupLat,
                        lng: formData.pickupLng,
                    },
                ],
                destinations: [
                    {
                        lat: formData.dropoffLat,
                        lng: formData.dropoffLng,
                    },
                ],
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (response: any, status: any) => {
                if (status === 'OK') {
                    const result =
                        response.rows[0].elements[0];
                    setDistance(result.distance.text);
                    setDuration(result.duration.text);
                }
            }
        );
    };

    type Stop = {
        address: string;
        lat: number | null;
        lng: number | null;
    };
    const [stops, setStops] =  useState<Stop[]>([]);
    const handleAddStop = () => {
        setStops([
            ...stops,
            { address: "", lat: null, lng: null }
        ]);
    };
    const handleRemoveStop = (index:any) => {
        const updated = stops.filter((_, i) => i !== index);
        setStops(updated);
    };

    const handleStopChange = (index:any, value:any) => {
        const updated = [...stops];
        updated[index].address = value;
        setStops(updated);
    };
    
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <main className="py-10">
                <div className="mx-auto max-w-5xl bg-white p-8 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.25)]">
                    <div className="mb-8">
                        <h3 className="text-2xl">Let's get you on your way!</h3>
                    </div>

                    <form className="grid gap-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 rounded-base -space-x-px">
                        <div className="flex w-full">
                            <label className={`btn-group w-full text-center cursor-pointer py-1 text-sm font-bold rounded-l-lg overflow-hidden text-center transition ${formData.tripType === 'oneway' ? 'active' :''}`}>
                                <input
                                    type="radio"
                                    className="sr-only"
                                    name="tripType"
                                    value="oneway"
                                    checked={formData.tripType === 'oneway'}
                                    onChange={e => handleFieldChange('tripType', e.target.value)}
                                />
                                <span className="inline-flex items-center gap-2 ">
                                    <i className="bi bi-arrow-right-circle-fill text-lg"></i>
                                    One-way
                                </span>
                            </label>
                            </div>
                        <div className="flex w-full">
                            <label className={`btn-group w-full text-center cursor-pointer py-1 text-sm font-bold rounded-r-lg overflow-hidden text-center transition ${formData.tripType === 'hourly' ? 'active' :''}`}>
                                <input
                                    type="radio"
                                    className="sr-only"
                                    name="tripType"
                                    value="hourly"
                                    checked={formData.tripType === 'hourly'}
                                    onChange={e => handleFieldChange('tripType', e.target.value)}
                                />
                                <span className="inline-flex items-center gap-2">
                                    <i className="bi bi-hourglass-top text-lg"></i>
                                    Hourly
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-6">
                        <div className="flex flex-col gap-2 col-span-2">
                            <span className="text-sm font-semibold text-slate-700">Pickup</span>
                            <div className="relative">
                                <span className="floating-icon pointer-events-none absolute inset-y-0 top-px left-3 flex items-center">
                                    <i className="bi bi-calendar"></i>
                                </span>
                                <input
                                    type="date"
                                    id="pickupDate"
                                    className="floating-input h-[60px] text-sm w-full h-10 rounded-md border border-gray-300 bg-gray-100 pl-10 pr-3 py-3 text-gray-700 placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-brand"
                                    value={formData.pickupDate}
                                    onChange={e => handleFieldChange('pickupDate', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-semibold text-slate-700">&nbsp;</span>
                            <div className="relative">
                                <span className="floating-icon pointer-events-none absolute inset-y-0 top-px left-3 flex items-center">
                                    <i className="bi bi-clock"></i>
                                </span>
                                <input
                                    type="time"
                                    id="pickupTime"
                                    className="floating-input h-[60px] text-sm w-full h-10 rounded-md border border-gray-300 bg-gray-100 pl-10 pr-3 py-3 text-gray-700 placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-brand"
                                    value={formData.pickupTime}
                                    onChange={e => handleFieldChange('pickupTime', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="grid-cols-2 rounded-base -space-x-px">
                            <label className={`btn-group w-full text-center cursor-pointer px-3 py-2 text-sm rounded-l-md overflow-hidden text-center transition ${formData.pickupLocationType === 'location' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    className="sr-only"
                                    name="pickup-location-type"
                                    value="location"
                                    checked={formData.pickupLocationType === 'location'}
                                    onChange={e => handleFieldChange('pickupLocationType', e.target.value)}
                                />
                                Location
                            </label>
                            <label className={`btn-group w-full text-center cursor-pointer px-3 py-2 text-sm rounded-r-md overflow-hidden text-center transition ${formData.pickupLocationType === 'airport' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    className="sr-only"
                                    name="pickup-location-type"
                                    value="airport"
                                    checked={formData.pickupLocationType === 'airport'}
                                    onChange={e => handleFieldChange('pickupLocationType', e.target.value)}
                                />
                                Airport
                            </label>
                        </div>

                        <div className="relative mt-2">
                            {formData.pickupLocationType === 'location' ? (
                                <>
                                    <div className="grid gap-2 relative">
                                        <span className="floating-icon absolute inset-y-0 top-px left-3 flex items-center">
                                            <i className="bi bi-geo-alt-fill"></i> 
                                        </span>
                                        <input
                                            type="text"
                                            id="pickup-location-input"
                                            className="floating-input text-sm w-full h-10 rounded-t-md border border-gray-300 bg-gray-100 pl-10 pr-3 py-3 text-gray-700 placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-brand"
                                            placeholder="Choose Location"
                                            value={formData.pickupLocation}
                                            onChange={(e) => {
                                                handleFieldChange('pickupLocation', e.target.value);
                                                handleLocationSearch(e.target.value, setPickupPredictions);
                                            }}
                                        />
                                        <span className="absolute inset-y-0 top-px right-3 flex items-center text-gray-400">
                                            <i className="bi bi-caret-down-fill"></i> 
                                        </span>
                                        <label className="floating-label absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-5 origin-[0] bg-neutral-primary block text-sm text-gray-300 mb-1">
                                            Location
                                        </label>
                                    </div>
                                    {pickupPredictions.length > 0 && (
                                        <ul className="absolute mt-1 z-50 w-full overflow-hidden rounded-md border border-gray-300 bg-white px-3 py-3 text-gray-700  shadow-lg">
                                            {pickupPredictions.map((pred) => (
                                                <li key={pred.place_id} className="border-b last:border-b-0">
                                                    <button
                                                        type="button"
                                                        className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            handlePlaceSelect(
                                                                pred.place_id,
                                                                'pickupLocation',
                                                                'pickupLat',
                                                                'pickupLng',
                                                                () => setPickupPredictions([])
                                                            );
                                                        }}
                                                    >
                                                        {pred.description}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            ) : (
                                <>
                                    <select
                                        className="w-full rounded-md border border border-gray-300 bg-white px-3 py-3 text-gray-700 text-sm"
                                        id="pickup-location"
                                        aria-label="Location"
                                        value={formData.pickupLocationAirport}
                                        onChange={e => handleFieldChange('pickupLocationAirport', e.target.value)}
                                    >
                                        <option value="">Choose Airport</option>
                                        {airports.map((airport) => (
                                            <option key={airport.id} value={airport.ident}>
                                                {airport.name} ({airport.ident})
                                            </option>
                                        ))}
                                    </select>
                                </>
                            )}
                        </div>

                        {formData.tripType === 'oneway' && (
                            <>
                                {stops.map((stop, index) => (
                                    <>
                                        <div className="grid gap-2 relative">
                                            <input
                                                key={index}
                                                type="text"
                                                placeholder={`Stop ${index + 1}`}
                                                className="floating-input text-sm w-full h-10 rounded-md border border-gray-300 bg-gray-100 pr-10 pl-3 py-3 text-gray-700 placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-brand"
                                                onChange={(e) =>
                                                    handleStopChange(index, e.target.value)
                                                }
                                            />
                                            <span className="floating-icon absolute inset-y-0 top-px right-3 flex items-center cursor-pointer" onClick={() => handleRemoveStop(index)}>
                                                <i className="bi bi-x-square-fill"></i> 
                                            </span>
                                            <label className="floating-label absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-5 origin-[0] bg-neutral-primary block text-sm text-gray-300 mb-1">
                                                {`Stop ${index + 1}`}
                                            </label>
                                        </div>
                                    </>
                                ))}
                                <div>
                                    <a href="#" className="add-stop px-3 py-3 text-sm rounded-md" onClick={(e) => {
                                        e.preventDefault();
                                        handleAddStop();
                                    }}> 
                                        <i className="bi bi-plus"></i> Add a stop
                                    </a>
                                </div>
                            </>
                        )}
                    </div>

                    {formData.tripType === 'oneway' ? (
                        <div className="grid gap-4">
                            <span className="text-sm font-semibold text-slate-700">Drop off</span>
                            <div className="grid-cols-2 rounded-base -space-x-px">
                                <label className={`btn-group w-full text-center cursor-pointer px-3 py-2 text-sm rounded-l-md overflow-hidden text-center transition ${formData.dropoffLocationType === 'location' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        className="sr-only"
                                        name="dropoff-location-type"
                                        value="location"
                                        checked={formData.dropoffLocationType === 'location'}
                                        onChange={e => handleFieldChange('dropoffLocationType', e.target.value)}
                                    />
                                    Location
                                </label>
                                <label className={`btn-group w-full text-center cursor-pointer px-3 py-2 text-sm rounded-r-md overflow-hidden text-center transition ${formData.dropoffLocationType === 'airport' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        className="sr-only"
                                        name="dropoff-location-type"
                                        value="airport"
                                        checked={formData.dropoffLocationType === 'airport'}
                                        onChange={e => handleFieldChange('dropoffLocationType', e.target.value)}
                                    />
                                    Airport
                                </label>
                            </div>
                            

                            <div className="relative">
                                {formData.dropoffLocationType === 'location' ? (
                                    <>
                                        <div className="grid gap-2 relative">
                                            <span className="floating-icon absolute inset-y-0 top-px left-3 flex items-center">
                                                <i className="bi bi-geo-alt-fill"></i> 
                                            </span>
                                            <input
                                                type="text"
                                                id="dropoff-location-input"
                                                className="floating-input text-sm w-full h-10 rounded-t-md border border-gray-300 bg-gray-100 pl-10 pr-3 py-3 text-gray-700 placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-brand"
                                                placeholder="Choose location"
                                                value={formData.dropoffLocation}
                                                onChange={(e) => {
                                                    handleFieldChange('dropoffLocation', e.target.value);
                                                    handleLocationSearch(e.target.value, setDropoffPredictions);
                                                }}
                                            />
                                            <span className="absolute inset-y-0 top-px right-3 flex items-center text-gray-400">
                                                <i className="bi bi-caret-down-fill"></i> 
                                            </span>
                                            <label className="floating-label absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-5 origin-[0] bg-neutral-primary block text-sm text-gray-300 mb-1">
                                                Location
                                            </label>
                                        </div>
                                        {dropoffPredictions.length > 0 && (
                                            <ul className="absolute mt-1 z-50 w-full overflow-hidden rounded-md border border-gray-300 bg-white px-3 py-3 text-gray-700  shadow-lg">
                                                {dropoffPredictions.map((pred) => (
                                                    <li key={pred.place_id} className="border-b last:border-b-0">
                                                        <button
                                                            type="button"
                                                            className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();

                                                                handlePlaceSelect(
                                                                    pred.place_id,
                                                                    'dropoffLocation',
                                                                    'dropoffLat',
                                                                    'dropoffLng',
                                                                    () => setDropoffPredictions([])
                                                                );
                                                            }}
                                                        >
                                                            {pred.description}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <select
                                            className="w-full rounded-md border border border-gray-300 bg-white px-3 py-3 text-gray-700 text-sm"
                                            id="dropoff-location"
                                            aria-label="Dropoff location"
                                            value={formData.dropoffLocationAirport}
                                            onChange={e => handleFieldChange('dropoffLocationAirport', e.target.value)}
                                        >
                                            <option value="">Choose Airport</option>
                                            {airports.map((airport) => (
                                                <option key={airport.id} value={airport.ident}>
                                                    {airport.name} ({airport.ident})
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-2 relative">
                            <span className="floating-icon absolute inset-y-0 top-px left-3 flex items-center">
                                <i className="bi bi-alarm-fill"></i> 
                            </span>
                            <input
                                type="number"
                                min="1"
                                className="floating-input text-sm w-full h-10 rounded-md border border-gray-300 bg-gray-100 pl-10 pr-3 py-3 text-gray-700 placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-brand"
                                id="hours"
                                placeholder="Hours"
                                value={formData.hours}
                                onChange={e => handleFieldChange('hours', e.target.value)}
                            />
                            <label htmlFor="hours" className="floating-label absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-5 origin-[0] bg-neutral-primary block text-sm text-gray-300 mb-1">Hours</label>
                        </div>
                        
                    )}

                    <div className="grid gap-4">
                        <label htmlFor="contactPhone" className="text-sm font-semibold text-slate-700">Contact Information</label>
                        <CountryPhoneInput
                            country="us"
                            enableAreaCodes={true}
                            value={formData.contactPhone}
                            onChange={(value: any) => handleFieldChange('contactPhone', value)}
                            onBlur={checkChontactPhoneExists}
                        />
                    </div>

                    {!contactPhoneExists && formData.contactPhone && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <label htmlFor="passengers" className="col-span-2 text-sm font-medium text-slate-700">We don't have that phone number on file. Please provide additional contact information. </label>
                            <div className="grid gap-2 relative">
                                <span className="floating-icon absolute inset-y-0 top-px left-3 flex items-center">
                                    <i className="bi bi-person-fill"></i> 
                                </span>
                                <input
                                    type="text"
                                    className="floating-input text-sm w-full h-10 rounded-md border border-gray-300 bg-gray-100 pl-10 pr-3 py-3 text-gray-700 placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-brand"
                                    id="firstname"
                                    placeholder="First name"
                                    value={formData.contactFirstName}
                                    onChange={e => handleFieldChange('contactFirstName', e.target.value)}
                                />
                                <label htmlFor="firstname" className="floating-label absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-5 origin-[0] bg-neutral-primary block text-sm text-gray-300 mb-1">First name</label>
                            </div>
                            <div className="grid gap-2 relative">
                                <span className="floating-icon absolute inset-y-0 top-px left-3 flex items-center">
                                    <i className="bi bi-person-fill"></i> 
                                </span>
                                <input
                                    type="text"
                                    className="floating-input text-sm w-full h-10 rounded-md border border-gray-300 bg-gray-100 pl-10 pr-3 py-3 text-gray-700 placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-brand"
                                    id="lastname"
                                    placeholder="Last name"
                                    value={formData.contactLastName}
                                    onChange={e => handleFieldChange('contactLastName', e.target.value)}
                                />
                                <label htmlFor="lastname" className="floating-label absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-5 origin-[0] bg-neutral-primary block text-sm text-gray-300 mb-1">Last name</label>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4">
                        <div className="grid gap-2 relative">
                            <span className="floating-icon absolute inset-y-0 top-px left-3 flex items-center font-bold text-sm">@</span>
                            <input
                                type="email"
                                className="floating-input text-sm w-full h-10 rounded-md border border-gray-300 bg-gray-100 pl-10 pr-3 py-3 text-gray-700 placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-brand"
                                id="email"
                                placeholder="name@example.com"
                                value={formData.contactEmail}
                                onChange={e => handleFieldChange('contactEmail', e.target.value)}
                            />
                            <label htmlFor="lastname" className="floating-label absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-5 origin-[0] bg-neutral-primary block text-sm text-gray-300 mb-1">
                                Email
                            </label>
                        </div>
                        <label htmlFor="passengers" className="text-sm font-medium text-slate-700">How many passengers are expected for this trip?</label>
                        <div className="grid gap-2 relative">
                            <span className="floating-icon absolute inset-y-0 top-px left-3 flex items-center font-bold text-sm">#</span>
                            <input
                                type="number"
                                min="1"
                                className="floating-input text-sm w-full h-10 rounded-md border border-gray-300 bg-gray-100 pl-10 pr-3 py-3 text-gray-700 placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-brand"
                                id="passengers"
                                placeholder=" "
                                value={formData.passengers}
                                onChange={e => handleFieldChange('passengers', e.target.value)}
                            />
                            <label htmlFor="passengers" className="floating-label absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-5 origin-[0] bg-neutral-primary block text-sm text-gray-300 mb-1">
                                # Passengers
                            </label>
                        </div>

                    </div>
                    {distance && duration && (
                        <div className="w-80 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl p-5">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold">Trip Summary</h2>
                                <p className="text-xs text-gray-400">Estimated route details</p>
                            </div>

                            <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">

                                <div className="flex flex-col items-center flex-1">
                                    <span className="text-xs text-gray-400"><i className="bi bi-geo-fill"></i> Distance</span>
                                    <span className="text-lg font-bold">{distance}</span>
                                </div>
                                <div className="w-px h-8 bg-white/20"></div>
                                <div className="flex flex-col items-center flex-1">
                                    <span className="text-xs text-gray-400"><i className="bi bi-alarm-fill"></i> Travel Time</span>
                                    <span className="text-lg font-bold">{duration}</span>
                                </div>

                            </div>
                            <div className="mt-3 text-center text-[11px] text-gray-500">
                                Based on current traffic conditions
                            </div>
                        </div>
                    )}
                    <button type="submit" className="submit-btn w-full rounded-md bg-[#cfb153] border border-[#cfb153] px-6 py-3 text-sm font-bold text-white transition">
                        Continue
                    </button>
                </form>

                <div className="mt-10">
                    <h3 className="text-2xl font-semibold text-slate-900">Bookings</h3>
                    <ul className="mt-4 space-y-2 text-slate-700">
                        {bookings.map((b: any) => (
                            <li key={b.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                {b.contactFirstName} {b.contactLastName} — {b.pickupDate} {b.pickupTime}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            </main>
            <Footer />
        </div>
    );
}

export default App;
