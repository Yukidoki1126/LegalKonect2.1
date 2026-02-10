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
    Map,
    Lock,
    Key,
    Loader2,
    Star,
    Navigation,
    Briefcase,
    SlidersHorizontal
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
        preferred_min_rating: null as number | null,
        preferred_max_distance: null as number | null,
        preferred_experience: null as string | null,
    });
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showMapModal, setShowMapModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

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
                preferred_min_rating: profile.preferred_min_rating,
                preferred_max_distance: profile.preferred_max_distance,
                preferred_experience: profile.preferred_experience,
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
                preferred_min_rating: formData.preferred_min_rating,
                preferred_max_distance: formData.preferred_max_distance,
                preferred_experience: formData.preferred_experience,
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
            setShowSuccessModal(true);
        } catch {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');

        // Validation
        if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
            setPasswordError('All fields are required');
            return;
        }

        if (passwordForm.new_password.length < 8) {
            setPasswordError('New password must be at least 8 characters');
            return;
        }

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setPasswordError('New passwords do not match');
            return;
        }

        setChangingPassword(true);

        try {
            await api.changePassword({
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password
            });

            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setShowPasswordModal(false);
            setPasswordForm({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
            setPasswordError('');
            setShowSuccessModal(true);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; errors?: { current_password?: string[] } } } };
            // Check for validation errors first
            if (err.response?.data?.errors?.current_password) {
                setPasswordError(err.response.data.errors.current_password[0]);
            } else if (err.response?.data?.message) {
                setPasswordError(err.response.data.message);
            } else {
                setPasswordError('Failed to change password. Please try again.');
            }
        } finally {
            setChangingPassword(false);
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
                <div className="pb-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl shadow-lg" style={{ 
                                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                                boxShadow: '0 8px 20px -5px rgba(37, 99, 235, 0.35)'
                            }}>
                                <User className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile Settings</h1>
                                <p className="text-muted-foreground mt-1">
                                    Update your personal information and legal interests
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowPasswordModal(true)}
                            className="flex items-center gap-2 text-foreground hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 transition-all"
                        >
                            <Lock className="h-4 w-4" />
                            Change Password
                        </Button>
                    </div>
                </div>

                {message.text && message.type === 'error' && (
                    <Card className='border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800'>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <p className='text-red-700 dark:text-red-300 font-medium'>
                                {message.text}
                            </p>
                        </CardContent>
                    </Card>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-foreground">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
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
                                            className="pl-9 focus:border-blue-500 focus:ring-blue-500/20"
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
                                            className="pl-9 focus:border-blue-500 focus:ring-blue-500/20"
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
                                            className="pl-9 focus:border-blue-500 focus:ring-blue-500/20"
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
                                            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 transition-all"
                                        >
                                            <Map className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Legal Interests */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-foreground">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                                    <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
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

                    {/* Recommendation Preferences */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-foreground">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                                    <SlidersHorizontal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                Recommendation Preferences
                            </CardTitle>
                            <CardDescription>
                                Set your preferred minimum rating, maximum distance, and experience level for law firm recommendations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Minimum Rating */}
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-sm font-medium">
                                    <Star className="h-4 w-4 text-amber-500" />
                                    Minimum Rating
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Only show law firms with at least this rating
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { value: null, label: 'Any Rating' },
                                        { value: 3.0, label: '3.0+' },
                                        { value: 3.5, label: '3.5+' },
                                        { value: 4.0, label: '4.0+' },
                                        { value: 4.5, label: '4.5+' },
                                    ].map((option) => (
                                        <button
                                            key={option.label}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, preferred_min_rating: option.value }))}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                                                formData.preferred_min_rating === option.value
                                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-transparent shadow-md shadow-blue-500/25'
                                                    : 'bg-background text-foreground border-border hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                            }`}
                                        >
                                            {option.value !== null && (
                                                <Star className="inline h-3.5 w-3.5 mr-1 -mt-0.5 fill-current" />
                                            )}
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Maximum Distance */}
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-sm font-medium">
                                    <Navigation className="h-4 w-4 text-green-500" />
                                    Maximum Distance
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Only show law firms within this distance from your location
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { value: null, label: 'Any Distance' },
                                        { value: 5, label: '5 km' },
                                        { value: 10, label: '10 km' },
                                        { value: 20, label: '20 km' },
                                        { value: 50, label: '50 km' },
                                        { value: 100, label: '100 km' },
                                    ].map((option) => (
                                        <button
                                            key={option.label}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, preferred_max_distance: option.value }))}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                                                formData.preferred_max_distance === option.value
                                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-transparent shadow-md shadow-blue-500/25'
                                                    : 'bg-background text-foreground border-border hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preferred Experience */}
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-sm font-medium">
                                    <Briefcase className="h-4 w-4 text-purple-500" />
                                    Preferred Experience
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Only show law firms with this experience level
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { value: null, label: 'Any Experience' },
                                        { value: '1-3', label: '1 – 3 years' },
                                        { value: '3-5', label: '3 – 5 years' },
                                        { value: '5-8', label: '5 – 8 years' },
                                        { value: '8-10', label: '8 – 10 years' },
                                        { value: '10+', label: '10+ years' },
                                    ].map((option) => (
                                        <button
                                            key={option.label}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, preferred_experience: option.value }))}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                                                formData.preferred_experience === option.value
                                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-transparent shadow-md shadow-blue-500/25'
                                                    : 'bg-background text-foreground border-border hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            {(formData.preferred_min_rating || formData.preferred_max_distance || formData.preferred_experience) && (
                                <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm font-medium text-foreground mb-2">Your Preferences Summary</p>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.preferred_min_rating && (
                                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                                <Star className="h-3 w-3 mr-1 fill-current" />
                                                {formData.preferred_min_rating}+ rating
                                            </Badge>
                                        )}
                                        {formData.preferred_max_distance && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                <Navigation className="h-3 w-3 mr-1" />
                                                Within {formData.preferred_max_distance} km
                                            </Badge>
                                        )}
                                        {formData.preferred_experience && (
                                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                                <Briefcase className="h-3 w-3 mr-1" />
                                                {formData.preferred_experience === '10+' ? '10+ years' : `${formData.preferred_experience} years`}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={saving} className="min-w-32 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 text-white transition-all duration-300">
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>

                {/* Map Dialog */}
                <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-foreground">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                Pin Your Location
                            </DialogTitle>
                            <DialogDescription className="text-foreground">
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
                            <Button variant="outline" onClick={() => setShowMapModal(false)} className="text-foreground hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400">
                                Cancel
                            </Button>
                            <Button onClick={() => setShowMapModal(false)} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 text-white">
                                Confirm Location
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Change Password Modal */}
                <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-foreground">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                                    <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                Change Password
                            </DialogTitle>
                            <DialogDescription className="text-foreground pt-2">
                                Enter your current password and choose a new one
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current_password" className="text-foreground font-medium">Current Password</Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    value={passwordForm.current_password}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                                    placeholder="Enter current password"
                                    className="text-foreground"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new_password" className="text-foreground font-medium">New Password</Label>
                                <Input
                                    id="new_password"
                                    type="password"
                                    value={passwordForm.new_password}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                                    placeholder="Enter new password (min 8 characters)"
                                    className="text-foreground"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm_password" className="text-foreground font-medium">Confirm New Password</Label>
                                <Input
                                    id="confirm_password"
                                    type="password"
                                    value={passwordForm.confirm_password}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                                    placeholder="Confirm new password"
                                    className="text-foreground"
                                    required
                                />
                            </div>
                            {passwordError && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                                    {passwordError}
                                </div>
                            )}
                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordForm({
                                            current_password: '',
                                            new_password: '',
                                            confirm_password: ''
                                        });
                                        setPasswordError('');
                                    }}
                                    className="text-foreground hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={changingPassword} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 text-white">
                                    {changingPassword ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Changing...
                                        </>
                                    ) : (
                                        'Change Password'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Success Modal */}
                <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <div className="flex items-center justify-center mb-4">
                                <div className="p-3 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30">
                                    <CheckCircle className="h-12 w-12 text-cyan-600 dark:text-cyan-400" />
                                </div>
                            </div>
                            <DialogTitle className="text-center text-2xl text-foreground">
                                Success!
                            </DialogTitle>
                            <DialogDescription className="text-center text-foreground pt-2">
                                {message.text || 'Your changes have been saved successfully.'}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="sm:justify-center">
                            <Button 
                                onClick={() => setShowSuccessModal(false)} 
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 text-white"
                            >
                                Got it, thanks!
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ClientLayoutNew>
    );
}
