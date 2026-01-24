import React, { useState, useEffect, useRef } from 'react';
import api from '@/services/api';
import { Specialization } from '@/types';
import ClientLayoutNew from '@/components/client/ClientLayoutNew';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete, Libraries } from '@react-google-maps/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Scale,
    CheckCircle,
    AlertCircle,
    Map
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const libraries: Libraries = ["places"];

export default function SettingsModern() {
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleSpecializationToggle = (id: number, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            specialization_ids: checked
                ? [...prev.specialization_ids, id]
                : prev.specialization_ids.filter((s) => s !== id),
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

            // Update AuthContext
            const userData = await api.getUser();
            setUser(userData);

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ClientLayoutNew>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading profile...</p>
                    </div>
                </div>
            </ClientLayoutNew>
        );
    }

    return (
        <ClientLayoutNew>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile Settings</h1>
                    <p className="text-muted-foreground">
                        Update your personal information and legal interests
                    </p>
                </div>

                {message.text && (
                    <Card className={message.type === 'error' ? 'border-destructive' : 'border-green-500'}>
                        <CardContent className="flex items-center gap-3 pt-6">
                            {message.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-destructive" />
                            )}
                            <p className={message.type === 'error' ? 'text-destructive' : 'text-green-600'}>
                                {message.text}
                            </p>
                        </CardContent>
                    </Card>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>
                                Your basic profile details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+63 XXX XXX XXXX"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            {isLoaded ? (
                                                <Autocomplete
                                                    onLoad={ref => autocompleteRef.current = ref}
                                                    onPlaceChanged={handlePlaceChanged}
                                                >
                                                    <Input
                                                        id="address"
                                                        name="address"
                                                        type="text"
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        placeholder="Enter your address"
                                                        className="pl-9"
                                                    />
                                                </Autocomplete>
                                            ) : (
                                                <Input
                                                    id="address"
                                                    name="address"
                                                    type="text"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    placeholder="Your address"
                                                    className="pl-9"
                                                />
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setShowMapModal(true)}
                                            title="Pin on Map"
                                        >
                                            <Map className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Legal Interests */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <Scale className="h-5 w-5" />
                                Legal Interests
                            </CardTitle>
                            <CardDescription>
                                Select the areas of law you're interested in
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                                {specializations.map((spec) => (
                                    <div key={spec.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`spec-${spec.id}`}
                                            checked={formData.specialization_ids.includes(spec.id)}
                                            onCheckedChange={(checked) => 
                                                handleSpecializationToggle(spec.id, checked as boolean)
                                            }
                                        />
                                        <Label
                                            htmlFor={`spec-${spec.id}`}
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {spec.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={saving} className="min-w-32">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>

                {/* Map Dialog */}
                <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-foreground">
                                <MapPin className="h-5 w-5" />
                                Pin Your Location
                            </DialogTitle>
                            <DialogDescription>
                                Click on the map to set your exact location
                            </DialogDescription>
                        </DialogHeader>

                        {isLoaded && (
                            <div className="space-y-4">
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
                                    <div className="p-3 rounded-lg bg-muted">
                                        <p className="text-sm text-foreground">
                                            <strong>Selected Address:</strong> {formData.address}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowMapModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => setShowMapModal(false)}>
                                Confirm Location
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ClientLayoutNew>
    );
}
