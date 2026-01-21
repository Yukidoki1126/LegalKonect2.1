import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Specialization } from '../../types';
import LawFirmLayout from '../../components/lawfirm/LawFirmLayout';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete, Libraries } from '@react-google-maps/api';
import './LawFirmDashboard.css';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const libraries: Libraries = ["places"];

export default function ProfileSettings() {
    const [formData, setFormData] = useState({
        firm_name: '',
        description: '',
        phone: '',
        email: '',
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
                api.getLawFirmProfile(),
                api.getSpecializations(),
            ]);
            
            setFormData({
                firm_name: profile.firm_name,
                description: profile.description || '',
                phone: profile.phone || '',
                email: profile.email || '',
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
            // Update profile info
            await api.updateLawFirmProfile({
                firm_name: formData.firm_name,
                description: formData.description,
                phone: formData.phone,
                email: formData.email,
                specialization_ids: formData.specialization_ids,
            });

            // Update location if coordinates exist
            if (formData.latitude && formData.longitude) {
                await api.updateLawFirmLocation({
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    address: formData.address,
                });
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <LawFirmLayout>
            <div className="law-firm-settings">
                <div className="page-header">
                    <h2>⚙️ Profile Settings</h2>
                    <p>Update your firm's public information and services</p>
                </div>

                {loading ? (
                    <div className="loading">Loading profile...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="settings-form">
                        <section className="settings-section">
                            <h3>🏛️ Firm Information</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Firm Name</label>
                                    <input
                                        type="text"
                                        name="firm_name"
                                        value={formData.firm_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contact Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Public Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Office Address</label>
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
                                                    placeholder="Enter office address"
                                                />
                                            </Autocomplete>
                                        ) : (
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
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
                                <div className="form-group full-width">
                                    <label>Firm Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="settings-section">
                            <h3>⚖️ Specializations</h3>
                            <p className="section-help">Select the areas of law your firm practices</p>
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
                                <h3>Pin Office Location</h3>
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
        </LawFirmLayout>
    );
}
