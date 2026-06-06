import airports from '../airports.json';
import { GOOGLE_MAPS_API_KEY } from './config';
const API_URL = import.meta.env.VITE_API_URL;
const airportsData = airports as any[];

export async function getBookings(): Promise<any[]> {
	const res = await fetch(`${API_URL}bookings`);
	if (!res.ok) throw new Error(`Failed to fetch bookings: ${res.status}`);
	return res.json();
}

export async function createBooking(booking: any): Promise<any> {
	const res = await fetch(`${API_URL}bookings`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(booking),
	});
	if (!res.ok) throw new Error(`Failed to create booking: ${res.status}`);
	return res.json();
}

export async function getAirports(): Promise<any[]> {
	return Promise.resolve(airportsData);
}

const GOOGLE_MAPS_SRC = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`; 

export function loadGoogleMaps(): Promise<void> { 
	const win = window as any; 
	if (win.google?.maps?.places?.AutocompleteService) { 
		return Promise.resolve(); 
	} 
	const existingScript = document.querySelector<HTMLScriptElement>('script[src*="maps.googleapis.com/maps/api/js"]'); 
	if (existingScript) { 
		return new Promise((resolve, reject) => { 
			if (win.google?.maps?.places?.AutocompleteService) { 
				resolve(); 
				return; 
			} 
			const onLoad = () => { 
				existingScript.removeEventListener('load', onLoad); 
				existingScript.removeEventListener('error', onError); 
				resolve(); 
			}; 
			const onError = (event: Event | string) => { 
				existingScript.removeEventListener('load', onLoad); 
				existingScript.removeEventListener('error', onError); 
				reject(new Error(`Google Maps script failed to load: ${ event }`)); 
			}; 
			
			existingScript.addEventListener('load', onLoad); 
			existingScript.addEventListener('error', onError); 
		}); 
	} 
	return new Promise((resolve, reject) => { 
		const script = document.createElement('script'); 
		script.src = GOOGLE_MAPS_SRC; 
		script.async = true; 
		script.defer = true; 
		script.addEventListener('load', () => resolve()); 
		script.addEventListener('error', (event) => reject(new Error(`Google Maps script failed to load: ${ event }`))); 
		document.head.appendChild(script); 
	}); 
}

export const getPlacePredictions = (input: string): Promise<any[]> => {
	return new Promise((resolve) => {
		if (!input || input.length < 2) {
			resolve([]);
			return;
		}
		const google = (window as any).google;

		if (!google?.maps?.places) {
			resolve([]);
			return;
		}

		const service = new google.maps.places.AutocompleteService();

		service.getPlacePredictions(
			{
				input,
			},
			(predictions: any, status: any) => {
				if (status === google.maps.places.PlacesServiceStatus.OK) {
					resolve(predictions || []);
				} else {
					resolve([]);
				}
			}
		);
	});
};

export const getPlaceDetails = (placeId: string): Promise<any> => {
	return new Promise((resolve, reject) => {
		const google = (window as any).google;

		const service = new google.maps.places.PlacesService(
			document.createElement('div')
		);

		service.getDetails(
			{
				placeId,
				fields: ['formatted_address', 'geometry', 'name'],
			},
			(place: any, status: any) => {
				if (status === google.maps.places.PlacesServiceStatus.OK) {
					resolve(place);
				} else {
					reject(status);
				}
			}
		);
	});
};

export async function getDistance(origin: string, destination: string): Promise<any> {
	const google = (window as any).google;
	if (!google?.maps?.places?.PlacesService) return null;

	const element = document.createElement('div');
	const service = new google.maps.places.PlacesService(element);

	service.getDistanceMatrix({
		origins: [origin],
		destinations: [destination],
		travelMode: google.maps.TravelMode.DRIVING
	}, (response: any, status: any) => {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			return response;
		} else {
			throw new Error(`Failed to fetch distance: ${status}`);
		}
	});
}
