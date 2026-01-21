import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Specialization } from '../../types';
import ClientLayout from '../../components/client/ClientLayout';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete, Libraries } from '@react-google-maps/api';
import './Dashboard.css';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const libraries: Libraries = ["places"];

export default function ClientSettings() {
    const { setUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        latitude: null as number | null,
        longitude: null as number | null,
        specialization_ids: [] as number[],
    });
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showMapModal, setShowMapModal] = useState(false);

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: libraries,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [profile, specs] = await Promise.all([
                api.getClientProfile(),
                api.getSpecializations(),
            ]);
            
            setFormData({
                name: profile.user?.name || '',
                email: profile.user?.email || '',
                phone: profile.phone || '',
                address: profile.address || '',
                latitude: profile.latitude,
                longitude: profile.longitude,
                specialization_ids: profile.specializations?.map(s => s.id) || [],
            });
            setSpecializations(specs);
        } catch {
            console.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                setFormData(prev => ({
                    ...prev,
                    address: place.formatted_address || prev.address,
                    latitude: place.geometry!.location!.lat(),
                    longitude: place.geometry!.location!.lng(),
                }));
            }
        }
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    setFormData(prev => ({
                        ...prev,
                        address: results[0].formatted_address,
                        latitude: lat,
                        longitude: lng,
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng,
                    }));
                }
            });
        }
    };

    const handleSpecializationToggle = (id: number) => {
        setFormData((prev) => ({
            ...prev,
            specialization_ids: prev.specialization_ids.includes(id)
                ? prev.specialization_ids.filter((s) => s !== id)
                : [...prev.specialization_ids, id],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await api.updateClientProfile({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                specialization_ids: formData.specialization_ids,
            });

            if (formData.latitude && formData.longitude) {
                await api.updateClientLocation({
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    address: formData.address,
                });
            }

            // Update AuthContext to reflect changes immediately
            const userData = await api.getUser();
            setUser(userData);

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <ClientLayout>
            <div className="client-settings">
                <div className="page-header">
                    <h2>⚙️ Profile Settings</h2>
                    <p>Update your personal information and legal interests</p>
                </div>

                {loading ? (
                    <div className="loading">Loading profile...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="settings-form">
                        <section className="settings-section">
                            <h3>👤 Personal Information</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+63 XXX XXX XXXX"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <div className="address-input-wrapper">
                                        {isLoaded ? (
                                            <Autocomplete
                                                onLoad={ref => autocompleteRef.current = ref}
                                                onPlaceChanged={handlePlaceChanged}
                                            >
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    placeholder="Enter your address"
                                                />
                                            </Autocomplete>
                                        ) : (
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Your address"
                                            />
                                        )}
                                        <button 
                                            type="button" 
                                            className="map-pin-btn"
                                            onClick={() => setShowMapModal(true)}
                                            title="Pin on Map"
                                        >
                                            📍
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="settings-section">
                            <h3>⚖️ Legal Interests</h3>
                            <p className="section-help">Select the areas of law you're interested in</p>
                            <div className="specializations-grid-settings">
                                {specializations.map((spec) => (
                                    <label key={spec.id} className="spec-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={formData.specialization_ids.includes(spec.id)}
                                            onChange={() => handleSpecializationToggle(spec.id)}
                                        />
                                        <span>{spec.name}</span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        {message.text && (
                            <div className={`message-banner ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}

                {showMapModal && isLoaded && (
                    <div className="modal-overlay">
                        <div className="modal map-modal">
                            <div className="modal-header">
                                <h3>Pin Your Location</h3>
                                <button className="close-btn" onClick={() => setShowMapModal(false)}>&times;</button>
                            </div>
                            <div className="map-container">
                                <GoogleMap
                                    mapContainerStyle={{ width: '100%', height: '400px' }}
                                    center={
                                        formData.latitude && formData.longitude 
                                        ? { lat: formData.latitude, lng: formData.longitude }
                                        : { lat: 14.5995, lng: 120.9842 } // Default to Manila
                                    }
                                    zoom={15}
                                    onClick={handleMapClick}
                                >
                                    {formData.latitude && formData.longitude && (
                                        <Marker position={{ lat: formData.latitude, lng: formData.longitude }} />
                                    )}
                                </GoogleMap>
                            </div>
                            <div className="map-modal-footer">
                                <p className="selected-address">
                                    <strong>Selected Address:</strong> {formData.address || 'None selected'}
                                </p>
                                <button className="btn-primary" onClick={() => setShowMapModal(false)}>Confirm Location</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ClientLayout>
    );
}
