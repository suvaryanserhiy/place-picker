import { useCallback, useEffect, useRef, useState } from 'react';

import logoImg from './assets/logo.png';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import Modal from './components/Modal.jsx';
import Places from './components/Places.jsx';
import { AVAILABLE_PLACES } from './data.js';
import { sortPlacesByDistance } from './loc.js';

const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
const storedPlaces = storedIds.map((id) =>
	AVAILABLE_PLACES.find((place) => place.id === id)
);

function App() {
	const selectedPlace = useRef();
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [availablePlaces, setAvailablePlaces] = useState([]);
	const [pickedPlaces, setPickedPlaces] = useState(storedPlaces);

	useEffect(() => {
		// will executes only after APP ocmponent function execution finished
		navigator.geolocation.getCurrentPosition((position) => {
			const sortedPlaces = sortPlacesByDistance(
				AVAILABLE_PLACES,
				position.coords.latitude,
				position.coords.longitude
			);
			setAvailablePlaces(sortedPlaces);
		});
	}, []); // if dependencies value are changed, will reexecute useEffect hook. If [] is empty React will never reexecute, if not define will reexecute every time

	function handleStartRemovePlace(id) {
		setModalIsOpen(true);
		selectedPlace.current = id;
	}

	function handleStopRemovePlace() {
		setModalIsOpen(false);
	}

	function handleSelectPlace(id) {
		setPickedPlaces((prevPickedPlaces) => {
			if (prevPickedPlaces.some((place) => place.id === id)) {
				return prevPickedPlaces;
			}
			const place = AVAILABLE_PLACES.find((place) => place.id === id);
			return [place, ...prevPickedPlaces];
		});

		// this is another sideEffect, but here we don't need to use useEffect hook. That's because we should avoid usege of useEffect and only use it when we must prevent infinite loops, or if we have code that can only run after the component function executed at least once
		const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
		if (storedIds.indexOf(id) === -1) {
			localStorage.setItem(
				'selectedPlaces',
				JSON.stringify([id, ...storedIds])
			);
		}
	}
	const handleRemovePlace = useCallback(function handleRemovePlace() {
		setPickedPlaces((prevPickedPlaces) =>
			prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
		);
		setModalIsOpen(false);
		const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || []; // fetch data from navigators local storage
		localStorage.setItem(
			'selectedPlaces',
			JSON.stringify(storedIds.filter((id) => id !== selectedPlace.current))
		);
	},[]);

	return (
		<>
			<Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
				<DeleteConfirmation
					onCancel={handleStopRemovePlace}
					onConfirm={handleRemovePlace}
				/>
			</Modal>

			<header>
				<img src={logoImg} alt='Stylized globe' />
				<h1>PlacePicker</h1>
				<p>
					Create your personal collection of places you would like to visit or
					you have visited.
				</p>
			</header>
			<main>
				<Places
					title="I'd like to visit ..."
					fallbackText={'Select the places you would like to visit below.'}
					places={pickedPlaces}
					onSelectPlace={handleStartRemovePlace}
				/>
				<Places
					title='Available Places'
					places={availablePlaces}
					fallbackText={'Sorting places by distance'}
					onSelectPlace={handleSelectPlace}
				/>
			</main>
		</>
	);
}

export default App;
