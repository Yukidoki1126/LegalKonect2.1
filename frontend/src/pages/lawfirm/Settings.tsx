import React, { useState, useEffect, useRef } from 'react';
import api from '@/services/api';
import { Specialization } from '@/types';
import LawFirmLayoutNew from '@/components/lawfirm/LawFirmLayoutNew';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete, Libraries } from '@react-google-maps/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Camera, MapPin, Phone, Mail, FileText, Upload, Trash2, Settings as SettingsIcon, X } from 'lucide-react';

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
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showMapModal, setShowMapModal] = useState(false);

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

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
            setProfileImageUrl((profile as unknown as { profile_image_url: string | null }).profile_image_url);
            setSpecializations(specs);
        } catch {
            console.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image must be less than 5MB' });
            return;
        }

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setMessage({ type: 'error', text: 'Only JPG, PNG, and WebP images are allowed' });
            return;
        }

        setUploadingImage(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.uploadLawFirmProfileImage(file);
            
            // Add cache-busting timestamp to force browser to reload the image
            const imageUrlWithTimestamp = `${response.profile_image_url}?t=${Date.now()}`;
            
            // Preload the image to ensure it's available before setting state
            const img = new Image();
            img.onload = () => {
                setProfileImageUrl(imageUrlWithTimestamp);
                setMessage({ type: 'success', text: 'Profile image uploaded successfully!' });
                setUploadingImage(false);
            };
            img.onerror = () => {
                setMessage({ type: 'error', text: 'Image uploaded but failed to display. Please refresh the page.' });
                setUploadingImage(false);
            };
            img.src = imageUrlWithTimestamp;
        } catch {
            setMessage({ type: 'error', text: 'Failed to upload image.' });
            setUploadingImage(false);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleImageDelete = async () => {
        if (!confirm('Are you sure you want to remove the profile image?')) return;

        setUploadingImage(true);
        try {
            await api.deleteLawFirmProfileImage();
            setProfileImageUrl(null);
            setMessage({ type: 'success', text: 'Profile image removed successfully!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to remove image.' });
        } finally {
            setUploadingImage(false);
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
        <LawFirmLayoutNew>
            <div className="space-y-8 p-6">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <SettingsIcon className="h-8 w-8" />
                        Profile Settings
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Update your firm's public information and services
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading profile...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Image Section */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Camera className="h-5 w-5" />
                                    Profile Image
                                </CardTitle>
                                <CardDescription>
                                    Upload an image of your office or firm (max 5MB, JPG/PNG/WebP)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-6">
                                    <div className="h-32 w-32 rounded-lg border-2 border-dashed border-border overflow-hidden flex items-center justify-center bg-muted">
                                        {profileImageUrl ? (
                                            <img 
                                                src={profileImageUrl} 
                                                alt="Firm profile" 
                                                className="h-full w-full object-cover"
                                                key={profileImageUrl} // Force re-render when URL changes
                                            />
                                        ) : (
                                            <Building2 className="h-16 w-16 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            accept="image/jpeg,image/png,image/webp"
                                            style={{ display: 'none' }}
                                            id="profile-image-input"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage}
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            {uploadingImage ? 'Uploading...' : (profileImageUrl ? 'Change Image' : 'Upload Image')}
                                        </Button>
                                        {profileImageUrl && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={handleImageDelete}
                                                disabled={uploadingImage}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Firm Information Section */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Firm Information
                                </CardTitle>
                                <CardDescription>
                                    Basic information about your law firm
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="firm_name">Firm Name *</Label>
                                        <Input
                                            id="firm_name"
                                            name="firm_name"
                                            value={formData.firm_name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter firm name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Contact Phone
                                        </Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Public Email
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            Office Address
                                        </Label>
                                        <div className="flex gap-2">
                                            {isLoaded ? (
                                                <Autocomplete
                                                    onLoad={ref => autocompleteRef.current = ref}
                                                    onPlaceChanged={handlePlaceChanged}
                                                    className="flex-1"
                                                >
                                                    <Input
                                                        id="address"
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        placeholder="Enter office address"
                                                    />
                                                </Autocomplete>
                                            ) : (
                                                <Input
                                                    id="address"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    placeholder="Enter office address"
                                                    className="flex-1"
                                                />
                                            )}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowMapModal(true)}
                                                title="Pin on Map"
                                            >
                                                <MapPin className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Firm Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Describe your firm, expertise, and services..."
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Specializations Section */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>Areas of Practice</CardTitle>
                                <CardDescription>
                                    Select the legal specializations your firm offers
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {specializations.map((spec) => (
                                        <div key={spec.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`spec-${spec.id}`}
                                                checked={formData.specialization_ids.includes(spec.id)}
                                                onCheckedChange={() => handleSpecializationToggle(spec.id)}
                                            />
                                            <Label
                                                htmlFor={`spec-${spec.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {spec.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Message Banner */}
                        {message.text && (
                            <div className={`p-4 rounded-lg border ${
                                message.type === 'success' 
                                    ? 'bg-green-50 border-green-200 text-green-800' 
                                    : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button type="submit" disabled={saving} size="lg">
                                {saving ? 'Saving Changes...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                )}

                {/* Map Modal */}
                {showMapModal && isLoaded && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-3xl mx-4">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div>
                                    <CardTitle>Pin Office Location</CardTitle>
                                    <CardDescription>Click on the map to set your office location</CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowMapModal(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg overflow-hidden border">
                                    <GoogleMap
                                        mapContainerStyle={{ width: '100%', height: '400px' }}
                                        center={
                                            formData.latitude && formData.longitude
                                                ? { lat: formData.latitude, lng: formData.longitude }
                                                : { lat: 14.5995, lng: 120.9842 }
                                        }
                                        zoom={15}
                                        onClick={handleMapClick}
                                    >
                                        {formData.latitude && formData.longitude && (
                                            <Marker position={{ lat: formData.latitude, lng: formData.longitude }} />
                                        )}
                                    </GoogleMap>
                                </div>
                                {formData.address && (
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Selected Address:</p>
                                        <p className="text-sm">{formData.address}</p>
                                    </div>
                                )}
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setShowMapModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => setShowMapModal(false)}>
                                        Confirm Location
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </LawFirmLayoutNew>
    );
}
